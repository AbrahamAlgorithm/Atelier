package handlers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"atelier/backend/internal/db"
	mw "atelier/backend/internal/api/middleware"
	authsvc "atelier/backend/internal/services/auth"
	"atelier/backend/internal/services/email"

	"github.com/jackc/pgx/v5"
	"github.com/labstack/echo/v4"
)

type AuthHandler struct {
	db          *db.DB
	authSvc     *authsvc.Service
	emailSvc    *email.Service
	frontendURL string
}

func NewAuthHandler(database *db.DB, authSvc *authsvc.Service, emailSvc *email.Service, frontendURL string) *AuthHandler {
	return &AuthHandler{db: database, authSvc: authSvc, emailSvc: emailSvc, frontendURL: frontendURL}
}

type registerRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type authResponse struct {
	AccessToken  string      `json:"access_token"`
	RefreshToken string      `json:"refresh_token"`
	User         interface{} `json:"user"`
}

func (h *AuthHandler) Register(c echo.Context) error {
	var req registerRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	req.Name = strings.TrimSpace(req.Name)

	if req.Email == "" || req.Password == "" || req.Name == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "email, password and name are required")
	}
	if len(req.Password) < 8 {
		return echo.NewHTTPError(http.StatusBadRequest, "password must be at least 8 characters")
	}

	hash, err := h.authSvc.HashPassword(req.Password)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to process password")
	}

	user, err := h.db.CreateUser(c.Request().Context(), req.Email, hash, req.Name)
	if err != nil {
		if strings.Contains(err.Error(), "unique") {
			return echo.NewHTTPError(http.StatusConflict, "email already registered")
		}
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create user")
	}

	return h.issueTokens(c, user.ID, user.Email, map[string]interface{}{
		"id":    user.ID,
		"email": user.Email,
		"name":  user.Name,
	})
}

func (h *AuthHandler) Login(c echo.Context) error {
	var req loginRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	user, err := h.db.GetUserByEmail(c.Request().Context(), req.Email)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid email or password")
	}

	if !h.authSvc.CheckPassword(user.PasswordHash, req.Password) {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid email or password")
	}

	return h.issueTokens(c, user.ID, user.Email, map[string]interface{}{
		"id":    user.ID,
		"email": user.Email,
		"name":  user.Name,
	})
}

func (h *AuthHandler) Refresh(c echo.Context) error {
	var body struct {
		RefreshToken string `json:"refresh_token"`
	}
	if err := c.Bind(&body); err != nil || body.RefreshToken == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "refresh_token is required")
	}

	tokenHash := h.authSvc.HashRefreshToken(body.RefreshToken)
	userID, expiresAt, err := h.db.GetRefreshToken(c.Request().Context(), tokenHash)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "invalid refresh token")
	}
	if time.Now().After(expiresAt) {
		_ = h.db.DeleteRefreshToken(c.Request().Context(), tokenHash)
		return echo.NewHTTPError(http.StatusUnauthorized, "refresh token expired")
	}

	user, err := h.db.GetUserByID(c.Request().Context(), userID)
	if err != nil {
		return echo.NewHTTPError(http.StatusUnauthorized, "user not found")
	}

	_ = h.db.DeleteRefreshToken(c.Request().Context(), tokenHash)

	return h.issueTokens(c, user.ID, user.Email, map[string]interface{}{
		"id":    user.ID,
		"email": user.Email,
		"name":  user.Name,
	})
}

func (h *AuthHandler) Logout(c echo.Context) error {
	var body struct {
		RefreshToken string `json:"refresh_token"`
	}
	if err := c.Bind(&body); err == nil && body.RefreshToken != "" {
		hash := h.authSvc.HashRefreshToken(body.RefreshToken)
		_ = h.db.DeleteRefreshToken(c.Request().Context(), hash)
	}
	return c.JSON(http.StatusOK, map[string]string{"message": "logged out"})
}

func (h *AuthHandler) Me(c echo.Context) error {
	userID := mw.UserID(c)
	user, err := h.db.GetUserByID(c.Request().Context(), userID)
	if err == pgx.ErrNoRows {
		return echo.NewHTTPError(http.StatusNotFound, "user not found")
	}
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to fetch user")
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"id":         user.ID,
		"email":      user.Email,
		"name":       user.Name,
		"avatar_url": user.AvatarURL,
		"created_at": user.CreatedAt,
	})
}

func (h *AuthHandler) ForgotPassword(c echo.Context) error {
	var req struct {
		Email string `json:"email"`
	}
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))

	// Always return 200 to avoid user enumeration
	user, err := h.db.GetUserByEmail(c.Request().Context(), req.Email)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]string{"message": "If that email exists, a reset link has been sent."})
	}

	raw, tokenHash, expiresAt := h.authSvc.GenerateRefreshToken()
	if err := h.db.CreatePasswordResetToken(c.Request().Context(), user.ID, tokenHash, expiresAt); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to create reset token")
	}

	resetURL := fmt.Sprintf("%s/reset-password?token=%s", h.frontendURL, raw)
	_ = h.emailSvc.SendPasswordReset(user.Email, resetURL)

	return c.JSON(http.StatusOK, map[string]string{"message": "If that email exists, a reset link has been sent."})
}

func (h *AuthHandler) ResetPassword(c echo.Context) error {
	var req struct {
		Token    string `json:"token"`
		Password string `json:"password"`
	}
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid request body")
	}
	if req.Token == "" || len(req.Password) < 8 {
		return echo.NewHTTPError(http.StatusBadRequest, "token and password (min 8 chars) are required")
	}

	tokenHash := h.authSvc.HashRefreshToken(req.Token)
	userID, expiresAt, err := h.db.ConsumePasswordResetToken(c.Request().Context(), tokenHash)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid or expired reset token")
	}
	if time.Now().After(expiresAt) {
		return echo.NewHTTPError(http.StatusBadRequest, "reset token has expired")
	}

	hash, err := h.authSvc.HashPassword(req.Password)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to process password")
	}
	if err := h.db.UpdateUserPassword(c.Request().Context(), userID, hash); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to update password")
	}
	// Invalidate all existing sessions
	_ = h.db.DeleteUserRefreshTokens(c.Request().Context(), userID)

	return c.JSON(http.StatusOK, map[string]string{"message": "Password updated. Please sign in."})
}

func (h *AuthHandler) issueTokens(c echo.Context, userID, email string, userJSON interface{}) error {
	accessToken, err := h.authSvc.GenerateAccessToken(userID, email)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to generate token")
	}

	rawRefresh, hash, expiresAt := h.authSvc.GenerateRefreshToken()
	if err := h.db.CreateRefreshToken(c.Request().Context(), userID, hash, expiresAt); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to store refresh token")
	}

	return c.JSON(http.StatusOK, authResponse{
		AccessToken:  accessToken,
		RefreshToken: rawRefresh,
		User:         userJSON,
	})
}

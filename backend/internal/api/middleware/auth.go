package middleware

import (
	"net/http"
	"strings"

	"atelier/backend/internal/services/auth"

	"github.com/labstack/echo/v4"
)

func JWT(authSvc *auth.Service) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			header := c.Request().Header.Get("Authorization")
			if !strings.HasPrefix(header, "Bearer ") {
				return echo.NewHTTPError(http.StatusUnauthorized, "missing authorization header")
			}

			tokenStr := strings.TrimPrefix(header, "Bearer ")
			claims, err := authSvc.ValidateAccessToken(tokenStr)
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "invalid or expired token")
			}

			c.Set("user_id", claims.UserID)
			c.Set("email", claims.Email)
			return next(c)
		}
	}
}

func UserID(c echo.Context) string {
	return c.Get("user_id").(string)
}

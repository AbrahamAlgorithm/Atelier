package email

import (
	"fmt"
	"log"
	"net/smtp"
	"strings"
)

type Service struct {
	host string
	port string
	user string
	pass string
	from string
}

func New(host, port, user, pass, from string) *Service {
	return &Service{host: host, port: port, user: user, pass: pass, from: from}
}

func (s *Service) SendPasswordReset(toEmail, resetURL string) error {
	subject := "Reset your Atelier password"
	body := fmt.Sprintf(`Hi,

You requested a password reset for your Atelier account.

Click the link below to set a new password (expires in 1 hour):

%s

If you didn't request this, you can safely ignore this email.

— Atelier AI`, resetURL)

	if s.host == "" {
		log.Printf("[email] password reset link for %s: %s", toEmail, resetURL)
		return nil
	}

	msg := "From: " + s.from + "\r\n" +
		"To: " + toEmail + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"Content-Type: text/plain; charset=UTF-8\r\n" +
		"\r\n" + body

	addr := s.host + ":" + s.port
	var auth smtp.Auth
	if s.user != "" {
		auth = smtp.PlainAuth("", s.user, s.pass, s.host)
	}

	if err := smtp.SendMail(addr, auth, s.from, []string{toEmail}, []byte(msg)); err != nil {
		// Avoid leaking SMTP credentials in logs
		errStr := err.Error()
		if strings.Contains(errStr, s.pass) {
			errStr = "[smtp auth error]"
		}
		return fmt.Errorf("send email: %s", errStr)
	}
	return nil
}

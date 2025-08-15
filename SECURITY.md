# Security Policy

## Supported Versions

We are committed to providing security updates for the following versions:

| Version | Supported          | Security Updates Until |
| ------- | ------------------ | ---------------------- |
| 2.x.x   | :white_check_mark: | December 2025          |
| 1.x.x   | :white_check_mark: | June 2025              |
| < 1.0   | :x:                | N/A                    |

## Reporting a Vulnerability

We take security seriously and appreciate your efforts to responsibly disclose any vulnerabilities
you find.

### How to Report

**Please do not create a public GitHub issue for security vulnerabilities.**

Instead, please report security vulnerabilities via one of these methods:

1. **Email (Preferred)**: security@poker-ai-solver.com
2. **Private Security Advisory**: Create a private security advisory on GitHub
3. **Encrypted Communication**: Use our PGP key for sensitive reports

### What to Include

When reporting a vulnerability, please include:

- **Description**: Clear description of the vulnerability
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Impact Assessment**: Potential impact and severity
- **Proof of Concept**: If available, include a PoC
- **Environment**: Affected versions and environments
- **Timeline**: If you plan to disclose publicly

### Response Timeline

- **Initial Response**: Within 24 hours
- **Status Update**: Within 72 hours
- **Fix Timeline**: Depends on severity (see below)
- **Public Disclosure**: After fix is available

### Severity Levels

| Level        | Description                         | Response Time |
| ------------ | ----------------------------------- | ------------- |
| **Critical** | Remote code execution, data breach  | 24-48 hours   |
| **High**     | Privilege escalation, data exposure | 1-2 weeks     |
| **Medium**   | Information disclosure, DoS         | 2-4 weeks     |
| **Low**      | Minor issues, best practices        | 1-2 months    |

## Security Best Practices

### For Users

- **Keep Updated**: Always use the latest stable version
- **Environment Variables**: Never commit sensitive data
- **HTTPS Only**: Use HTTPS in production environments
- **Regular Audits**: Run `npm audit` regularly
- **Dependency Updates**: Keep dependencies updated

### For Contributors

- **Input Validation**: Always validate and sanitize inputs
- **Authentication**: Implement proper authentication flows
- **Authorization**: Use proper authorization checks
- **Data Encryption**: Encrypt sensitive data in transit and at rest
- **Error Handling**: Don't expose sensitive information in errors

## Security Features

### Built-in Security

- **Content Security Policy**: Implemented CSP headers
- **XSS Protection**: Input sanitization and output encoding
- **CSRF Protection**: Token-based CSRF protection
- **Rate Limiting**: API rate limiting for abuse prevention
- **Input Validation**: Comprehensive input validation

### Dependencies

We regularly audit our dependencies for security vulnerabilities:

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update

# Check outdated packages
npm outdated
```

## Security Updates

### Update Process

1. **Vulnerability Discovery**: Security issue identified
2. **Assessment**: Impact and severity evaluation
3. **Fix Development**: Security patch development
4. **Testing**: Comprehensive security testing
5. **Release**: Security update release
6. **Disclosure**: Public disclosure with details

### Update Notifications

- **Security Advisories**: GitHub Security Advisories
- **Release Notes**: Security fixes in release notes
- **Email Notifications**: For critical vulnerabilities
- **Social Media**: Important security announcements

## Responsible Disclosure

### Guidelines

- **Private Reporting**: Report vulnerabilities privately first
- **Reasonable Timeline**: Allow reasonable time for fixes
- **Coordinated Disclosure**: Coordinate public disclosure
- **No Exploitation**: Don't exploit vulnerabilities beyond testing
- **Respect Privacy**: Don't access or modify user data

### Recognition

We recognize security researchers who responsibly disclose vulnerabilities:

- **Hall of Fame**: Listed in our security hall of fame
- **Acknowledgments**: Public acknowledgments
- **Bug Bounty**: Potential rewards for significant findings

## Security Contacts

### Primary Contacts

- **Security Team**: security@poker-ai-solver.com
- **Lead Maintainer**: @maintainer1
- **Security Coordinator**: @security-coordinator

### PGP Key

For encrypted communications:

```
-----BEGIN PGP PUBLIC KEY BLOCK-----
[PGP key will be added here]
-----END PGP PUBLIC KEY BLOCK-----
```

## Security Resources

### Documentation

- [Security Best Practices](docs/security-best-practices.md)
- [Authentication Guide](docs/authentication.md)
- [API Security](docs/api-security.md)
- [Deployment Security](docs/deployment-security.md)

### Tools

- **Dependency Scanning**: `npm audit`
- **Code Analysis**: ESLint security rules
- **Vulnerability Scanning**: Snyk integration
- **Security Headers**: Helmet.js configuration

### External Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
- [React Security](https://reactjs.org/docs/security.html)
- [Web Security Fundamentals](https://web.dev/security/)

## Compliance

### Standards

- **OWASP**: Following OWASP security guidelines
- **CWE**: Addressing Common Weakness Enumeration
- **NIST**: Following NIST cybersecurity framework
- **GDPR**: Data protection compliance

### Certifications

- **Security Audits**: Regular third-party security audits
- **Penetration Testing**: Annual penetration testing
- **Code Reviews**: Security-focused code reviews
- **Training**: Security training for contributors

---

Thank you for helping keep our project secure! 🔒

# Task 29: CI/CD pipeline

## Objective
GitHub Actions for testing, building, deploying to Cloud Run (dev/staging/prod).

## Context
Automate deployment to prevent human error and enable fast iteration. Implement continuous integration and deployment pipeline with multiple environments for safe, reliable releases.

## Steps

1. **Create GitHub Actions workflow for CI**
   - Create .github/workflows/ci.yml
   - Run on every push and pull request
   - Install dependencies (npm ci)
   - Run linter (ESLint, Prettier)
   - Run tests (unit tests, integration tests)
   - Build application to verify no build errors

2. **Add deployment jobs for dev/staging/prod environments**
   - Create separate deployment jobs for each environment
   - Dev: deploy on push to main branch
   - Staging: deploy on PR merge to main
   - Prod: deploy on release tag (v*.*.*)
   - Add manual approval for prod deployments

3. **Configure Cloud Run services for each environment**
   - Create three Cloud Run services (cloudcut-dev, cloudcut-staging, cloudcut-prod)
   - Configure service settings (CPU, memory, autoscaling)
   - Set up custom domains if needed
   - Configure IAM permissions for deployment

4. **Set up environment variables and secrets in GitHub**
   - Add GCP service account key as GitHub secret
   - Configure environment-specific variables (API keys, project IDs)
   - Use GitHub environments for dev/staging/prod
   - Protect production secrets with required reviewers

5. **Add branch protection rules**
   - Require CI checks to pass before merge
   - Require at least one approval for PRs
   - Prevent force push to main branch
   - Require branches to be up to date before merge
   - Enable automatic deletion of merged branches

6. **Configure deployment triggers**
   - Dev: automatic on push to main
   - Staging: automatic on PR merge to main
   - Prod: manual trigger on release tag
   - Add rollback capability for failed deployments
   - Send deployment notifications to Slack/Discord

## Verification

- [ ] CI workflow runs on every push
- [ ] CI workflow includes lint, test, and build steps
- [ ] Dev environment deploys automatically on push to main
- [ ] Staging environment deploys automatically on PR merge
- [ ] Prod environment requires manual trigger on release tag
- [ ] All three environments (dev/staging/prod) are accessible
- [ ] Environment variables configured correctly for each environment
- [ ] Branch protection prevents merge without passing CI
- [ ] Deployments succeed without manual intervention
- [ ] Failed deployments can be rolled back
- [ ] Deployment status visible in GitHub Actions
- [ ] Team receives notifications for deployment events

## Estimated Time
6 hours

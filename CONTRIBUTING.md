# Contributing to DevQuest

## Workflow
1. Create branch from `main`
2. Open PR early (Draft)
3. Keep PRs small (1 feature per PR)
4. At least 1 approval required
5. CI must pass before merge
6. Squash & merge

## Branch naming
- feature/<name>
- fix/<name>
- refactor/<name>
- chore/<name>

## Commit messages (Conventional Commits)
type(scope): message
Examples:
- feat(game): add day progression
- fix(router): guard /#/game
- chore(ci): add pages deploy

## Quality gates
- npm run lint
- npm run typecheck
- npm run build

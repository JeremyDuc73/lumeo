# Lumeo — Plateforme de micro-services instantanés

Monorepo contenant le **frontend** (Nuxt 3) et le **backend** (Symfony 7.2), entièrement dockerisé.

## 📁 Structure

```
lumeo/
├── front/                  # Nuxt 3 (Vue 3, TailwindCSS, PrimeVue)
├── back/                   # Symfony 7.2 (PHP 8.2, Doctrine, JWT)
├── docker/
│   ├── back/               # Dockerfiles + nginx vhost pour PHP-FPM
│   ├── front/              # Dockerfiles pour Nuxt
│   └── nginx/              # Reverse proxy prod
├── docker-compose.yml      # Dev local
├── docker-compose.prod.yml # Production
├── Makefile                # Commandes raccourcies
└── .github/workflows/      # CI/CD GitHub Actions
```

## 🚀 Démarrage rapide (dev)

```bash
# 1. Cloner le repo
git clone git@github.com:<user>/lumeo.git && cd lumeo

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (Stripe, etc.)

# 3. Lancer tout
make init
```

Cela va :
- Construire les images Docker dev
- Installer les dépendances (Composer + npm)
- Générer les clés JWT
- Exécuter les migrations

**Accès :**
| Service  | URL                                    |
|----------|----------------------------------------|
| Frontend | http://localhost:11600                  |
| API      | http://localhost:11601/api              |
| Admin    | http://localhost:11601/admin            |
| Mercure  | http://localhost:11602/.well-known/mercure |
| PgSQL    | localhost:11603                         |

## 📋 Commandes utiles

```bash
make up              # Démarrer les conteneurs
make down            # Arrêter les conteneurs
make logs            # Voir les logs
make back-sh         # Shell PHP
make front-sh        # Shell Node
make migrate         # Lancer les migrations
make jwt-keys        # Générer les clés JWT
make lint            # Lint frontend
make test-back       # Tests PHPUnit
make help            # Voir toutes les commandes
```

## 🏭 Production

### Architecture VPS

```
Internet → Caddy (TLS + reverse proxy) → Docker containers
              ├── :11600 → front (Nuxt SSR)
              ├── :11601 → back-nginx (Symfony API)
              └── :11602 → mercure (SSE)
```

- **Caddy** sur le host gère TLS automatique (Let's Encrypt) + routing
- Le projet est déployé dans `/var/www/lumeo`
- La config Caddy est dans `docker/caddy/lumeo.caddyfile` (à copier dans `/etc/caddy/conf.d/`)

### Déploiement manuel

```bash
# Sur le VPS
mkdir -p /var/www/lumeo && cd /var/www/lumeo
cp .env.example .env
# Remplir .env avec les valeurs de production

make prod-build
make prod-up
make prod-migrate
```

### Déploiement automatique (CI/CD)

Le pipeline GitHub Actions se déclenche sur push vers `main` :

1. **CI** (`ci.yml`) : lint frontend, PHPUnit backend, build Docker smoke test
2. **CD** (`deploy.yml`) : build 3 images → push GHCR → SCP fichiers → SSH deploy sur VPS → migrate → reload Caddy

#### Secrets GitHub à configurer

| Secret                     | Description                                         | Exemple                                                 |
|----------------------------|-----------------------------------------------------|---------------------------------------------------------|
| `VPS_HOST`                 | IP ou domaine du VPS                                | `123.45.67.89`                                          |
| `VPS_USER`                 | Utilisateur SSH                                     | `deploy`                                                |
| `VPS_SSH_KEY`              | Clé privée SSH (contenu complet)                    | `-----BEGIN OPENSSH PRIVATE KEY-----...`                |
| `NUXT_PUBLIC_API_BASE`     | URL API en prod                                     | `https://lumeo.jeremyduc.dev/api`                       |
| `NUXT_PUBLIC_MERCURE_HUB`  | URL Mercure en prod                                 | `https://lumeo.jeremyduc.dev/.well-known/mercure`       |
| `NUXT_PUBLIC_SERVER_BASE`  | URL serveur en prod                                 | `https://lumeo.jeremyduc.dev`                           |
| `STRIPE_PUBLIC_KEY`        | Clé publique Stripe                                 | `pk_test_xxx` ou `pk_live_xxx`                          |

Le `.env` de production sur le VPS (`/var/www/lumeo/.env`) doit contenir toutes les variables (DB, JWT, Stripe secret, Mercure, etc.).

## 🛠 Tech Stack

| Composant  | Technologie                              |
|------------|------------------------------------------|
| Frontend   | Nuxt 3, Vue 3, TailwindCSS, PrimeVue 4  |
| Backend    | Symfony 7.2, PHP 8.2, Doctrine ORM       |
| Base       | PostgreSQL 16                            |
| Auth       | Lexik JWT                                |
| Temps réel | Mercure (SSE)                            |
| Paiements  | Stripe                                   |
| Admin      | EasyAdmin 4                              |
| CI/CD      | GitHub Actions                           |
| Containers | Docker + Docker Compose                  |

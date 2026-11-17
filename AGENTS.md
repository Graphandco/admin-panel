# admin-panel — AGENTS.md

UI Next.js du dashboard (prod image registry + mode `docker-compose.dev.yml`).

**Règle** : toute modif ici → entrée datée ci-dessous (et index racine si feature majeure). Voir `../AGENTS.md`.

---

## Journal

### 2026-10-16 — Cartes mobile 50 % (VPS stats + WP dashboard)
- **Agent** : `b817ba01-c8d0-4304-bd9a-88eb93346ee0`
- **Quoi** : grilles en `grid-cols-2` dès le mobile (gauges / chips Docker ; mini-stats WP).
- **Fichiers** : `components/vps/VpsStatsPage.jsx`, `components/wordpress/WordPressDashboard.jsx`

### 2026-10-16 — Indicateur Dev header : visible seulement si actif
- **Agent** : `b817ba01-c8d0-4304-bd9a-88eb93346ee0`
- **Quoi** : en prod, « Dev » + point vert uniquement si `admin-panel-dev` tourne ; sinon rien (plus de point gris / loader).
- **Fichiers** : `components/panel-dev-indicator.jsx`

### 2026-10-16 — Sidebar mobile : fond Aura opaque
- **Agent** : `b817ba01-c8d0-4304-bd9a-88eb93346ee0`
- **Quoi** : Sheet mobile opaque avec Aura borné au panneau (`app-aura-bg-contained`, pas `fixed` viewport) ; largeur forcée `18rem` (comme avant) pour laisser voir le contenu derrière l’overlay.
- **Fichiers** : `components/ui/sidebar.jsx`, `components/app-aura-bg.jsx`, `app/globals.css`

### 2026-08 — Sidebar : sous-menus au clic (plus au survol)
- **Agent** : `8cd1cb82-15b1-4c84-9d09-655b0ca7744c`
- **Quoi** : trigger d’ouverture des sous-menus passé du hover au clic ; comportement d’exclusivité (un seul ouvert) conservé.
- **Fichiers** : `components/app-sidebar.jsx` (et/ou nav associée)

### 2026-08 — Boutons refresh / toasts
- **Agent** : `b817ba01-c8d0-4304-bd9a-88eb93346ee0`
- **Quoi** : refresh icon-only, couleurs alignées badges monitoring ; toast succès vert clair/foncé après actualisation.
- **Fichiers** : `components/refresh-button` (ou équivalent), usages + sonner

### 2026-08 — WordPress UI
- **Agent** : `b817ba01-…`
- **Quoi** : dashboard WP refactor ; extensions multisite (défaut = updates) ; badge Pro + bouton update désactivé ; sites WP avec latence (comme Monitoring) ; suppression page Accès.
- **Fichiers** : `components/wordpress/*`, `app/wordpress/*`

### 2026-08 — Monitoring / alertes
- **Agent** : `b817ba01-…`
- **Quoi** : page Alertes ; favicons sites ; option « monitorer la vitesse » + seuil réglages ; cache SWR mobile ajusté.
- **Fichiers** : `components/monitoring/*`, `components/agence/SitesPage.jsx`, `app/settings/page.jsx`, hooks SWR

### 2026-08/09 — SeaweedFS + Apps + home cards
- **Agent** : `b817ba01-…`
- **Quoi** : page SeaweedFS ; bucket perso ; liens filer ; page Apps (CRUD, images `public/apps`) ; cartes home SeaweedFS / Fail2Ban.
- **Fichiers** : `components/seaweedfs/*`, `app/vps/apps/*`, `components/home/*`, `components/ui/attachment.jsx`

### 2026-08 — Page Système
- **Agent** : `b817ba01-…`
- **Quoi** : `/vps/systeme` (hostname, kernel, CPU, infos hôte) ; cartes retirées de la home.
- **Fichiers** : `components/systeme/*`, `app/vps/systeme/*`

### 2026-09 — Panel-dev indicator + réglages
- **Agent** : `b817ba01-…`
- **Quoi** : indicateur header (prod) + carte Réglages start/stop ; constante hors `"use server"`.
- **Fichiers** : `panel-dev-indicator.jsx`, `panel-dev-settings-card.jsx`, `app/actions/panel-dev.js`, `lib/panel-dev.js`

### 2026-09 — VPS Stats refactor
- **Agent** : `b817ba01-…`
- **Quoi** : SemiGauges, historique combiné CPU/RAM/Disque, process bars, chips Docker storage ; ménage composants inutilisés.
- **Fichiers** : `components/vps/VpsStatsPage.jsx`, suppressions divers `components/*`

### 2026-09-02 — Docker Volumes
- **Agent** : `b817ba01-…`
- **Quoi** : `/docker/volumes` ; sidebar après Images ; KPI, détail conteneurs, bind mounts, prune.
- **Fichiers** : `components/docker/VolumesPage.jsx`, `app/docker/volumes/page.jsx`, `app/actions/docker.js`, `components/app-sidebar.jsx`, `DockerHeader.jsx`

### 2026-09-08 — Monitoring > Activité
- **Agent** : `b817ba01-…`
- **Quoi** : journal actions ; badge source daemon (docker events) ; filtres / pagination.
- **Fichiers** : `components/monitoring/ActivityPage.jsx`, `app/monitoring/activite/page.jsx`, `app/actions/activity.js`, `app-sidebar.jsx`, breadcrumbs

### 2026-09-09 — Fond Aura Glass Moonstone
- **Agent** : `b817ba01-…`
- **Quoi** : calques fixes Aura derrière l’app ; `app-bg` transparent.
- **Fichiers** : `components/app-aura-bg.jsx`, `app/globals.css`, `app/layout.jsx`

### 2026-09-23 — Retrait UI deploy Git / runner
- **Agent** : `b817ba01-…`
- **Quoi** : suppression `/deploy/git`, `DeployPage.jsx` ; `/deploy` = registry redeploy seul ; actions deploy allégées.
- **Fichiers** : `app/actions/deploy.js`, `app/deploy/*`, `components/deploy/*`

### 2026-11-13 — SeaweedFS : libellés instance mixte + bucket WordPress
- **Agent** : session courante
- **Quoi** : page `/seaweedfs` : sous-titre reflétant le mixte VPS (public + privé), message de non-configuration incluant `STORAGE_WORDPRESS`, et libellé « Buckets : » pour une instance contenant à la fois des buckets publics et privés (évite « Buckets privés : public, wordpress »).
- **Fichiers** : `components/seaweedfs/SeaweedfsPage.jsx`

### 2026-11-13 — SeaweedFS : sous-titre neutre
- **Agent** : session courante
- **Quoi** : remplacement du sous-titre statique par un libellé générique (`Surveillance des buckets SeaweedFS par instance`) afin de rester valide quel que soit le statut public/privé du bucket `wordpress`.
- **Fichiers** : `components/seaweedfs/SeaweedfsPage.jsx`

---

## Points d’attention

- Dev : `npm run docker:dev` → `dev.vps.graphandco.com` (hot-reload)
- Prod : `npm run docker:deploy` (build + push + recreate) — seulement si demandé
- Préserver le design system existant (pas de redesign générique)
- Documenter ici après chaque changement UI non trivial

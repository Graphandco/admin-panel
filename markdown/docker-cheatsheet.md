## 🐳 Docker Cheatsheet — Compose & Nettoyage

Ce document résume les commandes Docker Compose et les commandes de nettoyage Docker (prune), avec explications simples.

---

## 🚀 Docker Compose — Commandes essentielles

### ▶️ `docker compose up`

```bash
docker compose up
docker compose up -d
```

**Rôle :**

- Crée les conteneurs si nécessaire
- Lance les services définis dans `docker-compose.yml`
- `-d` = mode détaché (en arrière-plan)

---

### 🛠️ `docker compose build`

```bash
docker compose build
```

**Rôle :**

- Construit (ou reconstruit) les images Docker
- Ne lance pas les conteneurs

À utiliser quand :

- tu modifies le Dockerfile
- tu changes des dépendances

---

### 🔁 `docker compose up --build`

```bash
docker compose up -d --build
```

**Rôle :**

- Reconstruit les images
- Lance les conteneurs

➡️ Combine `build` + `up`

---

### 📁 Option `-f` (fichier Compose)

```bash
docker compose -f docker-compose.yml up
docker compose -f docker-compose.prod.yml up
```

**Rôle :**

- Spécifie le fichier Compose à utiliser
- Utile si le fichier n’a pas le nom par défaut

#### Combiner plusieurs fichiers

```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml up
```

Le second fichier override le premier.

---

### 🚫 `--no-cache` (build sans cache)

```bash
docker compose build --no-cache
docker compose up -d --build --no-cache
```

**Rôle :**

- Ignore le cache Docker
- Force un rebuild complet

À utiliser quand Docker cache mal les dépendances.

---

## 🧹 Nettoyage Docker (Prune)

### 📊 Voir l’espace utilisé

```bash
docker system df
docker system df -v
```

---

### 🧱 Nettoyer le cache de build (SAFE)

```bash
docker builder prune -af
```

**Supprime :**

- Cache de build Docker

**Ne supprime PAS :**

- conteneurs
- images utilisées
- volumes

➡️ Très recommandé en cron.

---

### 🗑️ Supprimer les images inutiles

```bash
docker image prune -a
```

**Supprime :**

- Images non utilisées par un conteneur

**Garde :**

- Images utilisées par conteneurs actifs ou arrêtés

---

### 💣 Nettoyage agressif (sans volumes)

```bash
docker system prune -af
```

**Supprime :**

- conteneurs arrêtés
- images inutilisées
- cache build
- réseaux inutilisés

⚠️ Peut casser des stacks de dev.

---

### 💀 Nettoyage TOTAL (avec volumes)

```bash
docker system prune -af --volumes
```

**Supprime aussi :**

- volumes Docker (bases de données, fichiers persistants)

⚠️ PERTE DE DONNÉES.

---

## ⏱️ Cron recommandé (Debian)

### Nettoyage cache chaque semaine

```bash
0 3 * * 0 docker builder prune -af
```

### Version intelligente (garder 7 jours)

```bash
0 3 * * * docker builder prune -af --filter "until=168h"
```

---

# 🧠 Bonnes pratiques

- Nettoyer le cache build régulièrement (weekly)
- Nettoyer les images à la main
- Ne pas automatiser `system prune -af` en prod
- Toujours faire un backup avant `--volumes`

---

## 📌 Commandes utiles

### Voir les images lourdes

```bash
docker images --format "{{.Repository}}:{{.Tag}} {{.Size}}" | sort -h
```

### Voir quels conteneurs utilisent quelles images

```bash
docker ps -a --format "table {{.Names}}\t{{.Image}}"
```

---

## ✅ TL;DR rapide

| Objectif        | Commande                            |
| --------------- | ----------------------------------- |
| Lancer stack    | `docker compose up -d`              |
| Rebuild + run   | `docker compose up -d --build`      |
| Choisir fichier | `docker compose -f file.yml up`     |
| Rebuild propre  | `docker compose build --no-cache`   |
| Nettoyer cache  | `docker builder prune -af`          |
| Nettoyer images | `docker image prune -a`             |
| Tout nettoyer   | `docker system prune -af --volumes` |

---

# Damien — Portfolio

Portfolio personnel de Damien, Community Manager & Graphiste Junior.  
Construit avec React + Vite, Supabase (BDD + Storage), Tailwind CSS (CDN) et Framer Motion.

## Stack

- **React 18** + **Vite**
- **React Router v6** — routing SPA
- **Supabase** — authentification, base de données, stockage fichiers
- **Framer Motion** — animations d'entrée et au scroll
- **Tailwind CSS** via CDN
- **Iconify** — icônes
- **UnicornStudio** — fond animé (hero)

## Pages publiques

| Route | Description |
|---|---|
| `/` | Landing page (hero, projets récents, about, services, contact) |
| `/projects` | Grille de tous les projets avec filtres par catégorie |
| `/projects/:slug` | Détail d'un projet (galerie + lightbox) |

## Dashboard admin

| Route | Description |
|---|---|
| `/admin/login` | Connexion (email / mot de passe Supabase) |
| `/admin` | Tableau de bord |
| `/admin/projects` | Gérer les projets (CRUD) |
| `/admin/carousel` | Gérer le carrousel d'images |
| `/admin/services` | Gérer les services |
| `/admin/gallery` | Gérer la galerie |
| `/admin/profile` | Modifier le profil, bio, stats, réseaux |

## Démarrage

```bash
npm install
npm run dev
```

## Variables d'environnement

Créer un fichier `.env.local` à la racine :

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## Build

```bash
npm run build
```

Le dossier `dist/` contient le site statique prêt à déployer (Vercel, Netlify, etc.).

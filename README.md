# 🔐 Application de Stéganographie LSB

Une application web moderne et interactive pour cacher et récupérer des messages secrets dans des images en utilisant la technique LSB (Least Significant Bit).

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3.3-green.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Demo](https://img.shields.io/badge/Demo-Live-success.svg)](https://stegano-app.onrender.com/)

## 🌟 Démo en ligne

👉 **[Essayez l'application](https://stegano-app.onrender.com/)**

## 📖 Table des matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Principe LSB](#-principe-lsb)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Structure du projet](#-structure-du-projet)
- [Déploiement](#-déploiement)
- [Captures d'écran](#-captures-décran)
- [Contributions](#-contributions)
- [Auteur](#-auteur)
- [Licence](#-licence)

## 🎯 Aperçu

Cette application permet de :
- **Encoder** : Cacher un message texte dans une image de manière invisible
- **Décoder** : Extraire un message caché d'une image encodée
- **Analyser** : Visualiser les détails techniques de l'encodage (bits modifiés, pixels utilisés, etc.)

La méthode LSB modifie le bit le moins significatif de chaque composante RGB des pixels, rendant les modifications imperceptibles à l'œil nu.

## ✨ Fonctionnalités

### 🔒 Encodage
- Interface drag & drop intuitive
- Support de plusieurs formats d'images (PNG, JPG, BMP)
- Aperçu en temps réel de l'image
- Compteur de caractères avec indicateur de capacité
- Téléchargement de l'image encodée
- Informations détaillées sur l'encodage (debug mode)

### 🔓 Décodage
- Upload simple de l'image encodée
- Extraction automatique du message caché
- Affichage du message dans une zone de texte

### 🔍 Analyse détaillée
- Visualisation du message en binaire
- Statistiques d'encodage (bits utilisés, pixels modifiés)
- Tableau des 20 premières modifications de pixels
- Comparaison avant/après pour chaque pixel modifié

### 🎨 Interface utilisateur
- Design moderne et responsive
- Animations fluides
- Navigation par onglets
- Alertes visuelles pour le feedback utilisateur
- Compatible mobile et desktop

## 💡 Principe LSB

La stéganographie LSB (Least Significant Bit) fonctionne en modifiant le dernier bit de chaque composante de couleur (Rouge, Vert, Bleu) d'un pixel.

### Exemple concret :

```
Pixel original RGB : (152, 47, 89)
En binaire         : (10011000, 00101111, 01011001)

Après encodage     : (10011001, 00101110, 01011000)
Nouveau RGB        : (153, 46, 88)
```

**Différence visuelle** : Imperceptible ! Les valeurs ne changent que de ±1.

### Processus d'encodage :

1. **Conversion du message** en binaire (8 bits par caractère)
2. **Ajout de la longueur** du message (32 bits) en en-tête
3. **Modification des pixels** : remplacement du LSB de chaque composante RGB
4. **Sauvegarde** de l'image modifiée au format PNG

### Processus de décodage :

1. **Lecture de la longueur** (32 premiers bits)
2. **Extraction des bits** du message
3. **Conversion binaire → texte** (8 bits → 1 caractère)
4. **Affichage** du message original

## 🛠️ Technologies

### Backend
- **Python 3.9+** : Langage principal
- **Flask 2.3.3** : Framework web
- **Pillow 10.0.0** : Traitement d'images
- **NumPy 1.24.3** : Manipulation de tableaux de pixels
- **Gunicorn 21.2.0** : Serveur WSGI pour production

### Frontend
- **HTML5** : Structure
- **CSS3** : Styles et animations
- **JavaScript (Vanilla)** : Logique client
- **API Fetch** : Communication avec le backend

### Déploiement
- **Render** : Plateforme de déploiement
- **Git/GitHub** : Gestion de version

## 📦 Installation

### Prérequis

- Python 3.9 ou supérieur
- pip (gestionnaire de paquets Python)
- Git

### Étapes d'installation

1. **Cloner le dépôt**

```bash
git clone https://github.com/oscar0023/stegano-app_v1.git
cd stegano-app_v1
```

2. **Créer un environnement virtuel**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. **Installer les dépendances**

```bash
pip install -r requirements.txt
```

4. **Lancer l'application**

```bash
# Mode développement
python app.py

# Mode production avec Gunicorn
gunicorn app:app
```

5. **Accéder à l'application**

Ouvrez votre navigateur et allez sur : `http://localhost:5000`

## 🚀 Utilisation

### Encoder un message

1. Accédez à l'onglet **"Encoder"**
2. **Glissez-déposez** une image ou cliquez pour la sélectionner
3. **Entrez votre message** secret dans la zone de texte
4. Cliquez sur **"Cacher le message"**
5. **Téléchargez** l'image encodée
6. (Optionnel) Cliquez sur **"Plus d'infos"** pour voir les détails techniques

### Décoder un message

1. Accédez à l'onglet **"Décoder"**
2. **Uploadez l'image** contenant le message caché
3. Cliquez sur **"Décoder le message"**
4. Le **message secret** s'affiche automatiquement

### Visualiser les informations techniques

Après un encodage, cliquez sur **"Plus d'infos"** pour voir :
- Le message en binaire complet
- Le nombre de bits utilisés
- Le nombre de pixels modifiés
- Un tableau détaillé des 20 premières modifications

## 📁 Structure du projet

```
stegano-app_v1/
│
├── app.py                      # Application Flask principale
├── stegano_lsb.py             # Logique d'encodage/décodage LSB
├── requirements.txt            # Dépendances Python
├── gunicorn_config.py         # Configuration Gunicorn
├── render.yaml                 # Configuration déploiement Render
├── README.md                   # Documentation (ce fichier)
│
├── static/                     # Fichiers statiques
│   ├── css/
│   │   └── style.css          # Styles CSS
│   └── js/
│       └── script.js          # JavaScript client
│
└── templates/                  # Templates HTML
    └── index.html             # Page principale
```

### Fichiers principaux

#### `app.py`
Point d'entrée de l'application Flask avec :
- Routes `/encode` et `/decode`
- Gestion des uploads
- API pour les informations de debug
- Configuration pour Render

#### `stegano_lsb.py`
Contient les fonctions principales :
- `hide_message()` : Encode un message dans une image
- `discover_message()` : Décode un message d'une image

#### `static/js/script.js`
Classe `SteganoApp` gérant :
- Navigation entre onglets
- Upload d'images (drag & drop)
- Appels API asynchrones
- Affichage des résultats

## 🌐 Déploiement

### Déploiement sur Render

L'application est configurée pour être déployée sur Render :

1. **Connectez votre dépôt GitHub** à Render
2. **Créez un nouveau Web Service**
3. Utilisez les paramètres suivants :
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `gunicorn app:app`
   - **Environment** : Python 3.9

Le fichier `render.yaml` contient toute la configuration nécessaire.

### Variables d'environnement

```bash
PORT=10000                    # Port du serveur
PYTHON_VERSION=3.9.0         # Version Python
```

## 📸 Captures d'écran

### Interface d'encodage
*Glissez-déposez une image et entrez votre message secret*

### Interface de décodage
*Uploadez une image encodée pour révéler le message caché*

### Informations détaillées
*Visualisez les modifications pixel par pixel*

## 🤝 Contributions

Les contributions sont les bienvenues ! Pour contribuer :

1. **Forkez** le projet
2. **Créez une branche** pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. **Committez** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Pushez** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrez une Pull Request**

### Idées d'améliorations

- [ ] Ajout d'un chiffrement AES avant l'encodage
- [ ] Support de plusieurs méthodes de stéganographie (DCT, DWT)
- [ ] Mode multi-bit (2-3 bits par composante)
- [ ] Comparaison visuelle avant/après encodage
- [ ] Support des images RGBA (canal alpha)

## 👨‍💻 Auteur

**Oscar ALIDJINOU**

- 🌐 Lien de l'application : [stegano-app.onrender.com](https://stegano-app.onrender.com/)
- 💼 GitHub : [@oscar0023](https://github.com/oscar0023)

## 🎓 Contexte académique

Ce projet a été développé dans le cadre d'un projet académique sur la sécurité de l'information et la cryptographie. Il illustre les concepts de :

- **Stéganographie** : dissimulation d'information
- **Traitement d'images** : manipulation de pixels
- **Développement web** : création d'interfaces utilisateur
- **Déploiement** : mise en production d'applications

### ⚠️ Avertissements

- Cette application est **à but pédagogique**
- Le LSB seul **n'offre pas de chiffrement** : le message peut être extrait facilement
- Pour une **vraie sécurité**, combinez avec du chiffrement (AES, RSA)
- Les images **JPEG avec compression** peuvent perdre le message caché

### 💡 Recommandations

- Utilisez des images **PNG** pour préserver l'intégrité
- Ne partagez pas d'informations sensibles sans chiffrement additionnel
- Testez toujours que le décodage fonctionne avant de supprimer l'original

## 📚 Ressources

- [Documentation Flask](https://flask.palletsprojects.com/)
- [Documentation Pillow](https://pillow.readthedocs.io/)
- [LSB Steganography (Wikipedia)](https://en.wikipedia.org/wiki/Steganography)
- [NumPy Documentation](https://numpy.org/doc/)

<div align="center">

**⭐ Si ce projet vous a plu, n'hésitez pas à lui donner une étoile !**

Made with ❤️ by Oscar ALIDJINOU

</div>

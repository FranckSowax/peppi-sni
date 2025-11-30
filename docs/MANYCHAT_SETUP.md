# Configuration ManyChat WhatsApp pour PEPPI-SNI

## 📋 Vue d'ensemble

Ce guide explique comment configurer ManyChat pour envoyer les rapports terrain vers votre dashboard PEPPI-SNI.

## 🔧 Prérequis

1. Compte ManyChat Pro avec WhatsApp Business API
2. Accès à Supabase (projet PEPPI-SNI)
3. Numéro WhatsApp Business vérifié

---

## 📊 Structure de la Table Supabase

La table `whatsapp_messages` stocke tous les messages :

```sql
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY,
  sender_name TEXT NOT NULL,
  sender_phone TEXT NOT NULL,
  project_id INTEGER,
  project_name TEXT,
  report_type TEXT,  -- 'avancement', 'probleme', 'livraison', 'photos', 'message'
  content TEXT NOT NULL,
  priority TEXT,     -- 'haute', 'moyenne', 'basse'
  photos TEXT[],     -- Array d'URLs
  status TEXT,       -- 'nouveau', 'lu', 'traite'
  created_at TIMESTAMP,
  processed_at TIMESTAMP,
  processed_by TEXT
);
```

---

## 🔄 Flow ManyChat - Configuration Étape par Étape

### Étape 1: Créer les Variables Personnalisées

Dans ManyChat > Settings > Custom Fields, créez :

| Nom | Type | Description |
|-----|------|-------------|
| `user_name` | Text | Nom de l'expéditeur |
| `project_id` | Number | ID du projet |
| `project_name` | Text | Nom du projet |
| `report_type` | Text | Type de rapport |
| `priority` | Text | Priorité |
| `message_content` | Text | Contenu du message |
| `photos_urls` | Text | URLs des photos (séparées par virgule) |
| `photos_count` | Number | Nombre de photos |

### Étape 2: Créer le Flow Principal

#### Block 1: Trigger
- **Trigger Type**: Keyword
- **Keywords**: `RAPPORT`, `SNI`, `URGENT`

#### Block 2: Identification
```
Message: 👋 Bienvenue sur le système de rapport SNI!
         Quel est votre nom complet?

Action: Save response to {{user_name}}
```

#### Block 3: Sélection du Projet
```
Message: 🏗️ Sur quel projet travaillez-vous?

Quick Replies:
- "Résidence Les Palmiers" → Set project_id=1, project_name="Résidence Les Palmiers"
- "Centre Commercial Oloumi" → Set project_id=2, project_name="Centre Commercial Oloumi"
- "Logements Nzeng-Ayong" → Set project_id=3, project_name="Logements Sociaux Nzeng-Ayong"
- "Bureaux Ministériels" → Set project_id=4, project_name="Bureaux Ministériels"
- "École Akébé" → Set project_id=5, project_name="École Primaire Akébé"
- "Hôpital Franceville" → Set project_id=6, project_name="Hôpital Régional Franceville"
```

#### Block 4: Type de Rapport
```
Message: 📋 Quel type de rapport souhaitez-vous faire?

Quick Replies:
- "📊 Avancement travaux" → Set report_type="avancement"
- "⚠️ Signaler un problème" → Set report_type="probleme"
- "📦 Livraison matériaux" → Set report_type="livraison"
- "📸 Envoyer des photos" → Set report_type="photos"
- "💬 Message libre" → Set report_type="message"
```

#### Block 5: Priorité
```
Message: ⚡ Quelle est l'urgence de ce rapport?

Quick Replies:
- "🔴 HAUTE - Action immédiate" → Set priority="haute"
- "🟡 MOYENNE - Dans la journée" → Set priority="moyenne"
- "🟢 BASSE - Information" → Set priority="basse"
```

#### Block 6: Message Détaillé
```
Message: 📝 Décrivez la situation en détail:

Action: Save response to {{message_content}}
```

#### Block 7: Photos (Optionnel)
```
Message: 📸 Voulez-vous ajouter des photos?

Quick Replies:
- "📷 Oui, envoyer des photos" → Go to Photo Upload Block
- "⏭️ Non, continuer" → Go to Confirmation Block

--- Photo Upload Block ---
Message: Envoyez vos photos maintenant (max 5 images)
         Tapez "TERMINÉ" quand vous avez fini.

Condition: If message contains image
  → Save image URL to {{photos_urls}} (append)
  → Increment {{photos_count}}
  → Loop back

Condition: If message = "TERMINÉ"
  → Go to Confirmation Block
```

#### Block 8: Confirmation
```
Message: 📋 RÉCAPITULATIF DE VOTRE RAPPORT
         ─────────────────────────────────
         👤 Expéditeur: {{user_name}}
         🏗️ Projet: {{project_name}}
         📋 Type: {{report_type}}
         ⚡ Priorité: {{priority}}
         📝 Message: {{message_content}}
         📸 Photos: {{photos_count}} image(s)
         
         Confirmer l'envoi?

Quick Replies:
- "✅ Confirmer et envoyer" → Go to Webhook Block
- "✏️ Modifier" → Go to Block 3
- "❌ Annuler" → End Flow
```

#### Block 9: Webhook vers Supabase
```
Action: External Request (POST)

URL: https://wrcybztcrcoubbzjcwej.supabase.co/rest/v1/whatsapp_messages

Headers:
- apikey: [VOTRE_SUPABASE_ANON_KEY]
- Authorization: Bearer [VOTRE_SUPABASE_ANON_KEY]
- Content-Type: application/json
- Prefer: return=minimal

Body (JSON):
{
  "sender_name": "{{user_name}}",
  "sender_phone": "{{phone}}",
  "project_id": {{project_id}},
  "project_name": "{{project_name}}",
  "report_type": "{{report_type}}",
  "content": "{{message_content}}",
  "priority": "{{priority}}",
  "photos": [{{photos_urls}}],
  "status": "nouveau"
}
```

#### Block 10: Confirmation Finale
```
Message: ✅ Rapport envoyé avec succès!
         
         📌 Votre rapport a été transmis à l'équipe.
         📊 Statut: En attente de traitement
         
         Vous recevrez une notification 
         lorsque votre rapport sera traité.
         
         Merci pour votre contribution! 🙏

Quick Replies:
- "📋 Nouveau rapport" → Go to Block 2
- "📞 Contacter le support" → Send support contact
```

---

## 🔑 Configuration des Clés API

### Récupérer la clé Supabase

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez le projet `wrcybztcrcoubbzjcwej`
3. Settings > API
4. Copiez la clé `anon public`

### Configurer dans ManyChat

1. ManyChat > Settings > Integrations
2. Ajoutez une nouvelle intégration Webhook
3. Collez l'URL et les headers

---

## 📱 Test du Flow

### Message de test
Envoyez "RAPPORT" au numéro WhatsApp Business pour démarrer le flow.

### Vérification dans Supabase
```sql
SELECT * FROM whatsapp_messages ORDER BY created_at DESC LIMIT 10;
```

### Vérification dans le Dashboard
Allez sur https://peppisni.netlify.app/dashboard/feed

---

## 🔔 Notifications (Optionnel)

### Pour les alertes haute priorité

Ajoutez une condition après le webhook :

```
Condition: If {{priority}} = "haute"
  → Send notification to Slack/Email
  → Tag message as urgent
```

### Webhook Slack
```json
{
  "text": "🚨 ALERTE HAUTE PRIORITÉ",
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Nouveau rapport urgent*\n👤 {{user_name}}\n🏗️ {{project_name}}\n📝 {{message_content}}"
      }
    }
  ]
}
```

---

## 📊 Mapping des Projets

| ID | Nom du Projet |
|----|---------------|
| 1 | Résidence Les Palmiers |
| 2 | Centre Commercial Oloumi |
| 3 | Logements Sociaux Nzeng-Ayong |
| 4 | Bureaux Ministériels |
| 5 | École Primaire Akébé |
| 6 | Hôpital Régional Franceville |

---

## 🛠️ Dépannage

### Le webhook ne fonctionne pas
1. Vérifiez la clé API Supabase
2. Vérifiez que RLS est configuré pour INSERT
3. Testez avec curl :
```bash
curl -X POST 'https://wrcybztcrcoubbzjcwej.supabase.co/rest/v1/whatsapp_messages' \
  -H "apikey: VOTRE_CLE" \
  -H "Authorization: Bearer VOTRE_CLE" \
  -H "Content-Type: application/json" \
  -d '{"sender_name":"Test","sender_phone":"+241000000","content":"Test message","priority":"basse","status":"nouveau"}'
```

### Les photos ne s'affichent pas
1. Vérifiez que les URLs sont accessibles publiquement
2. Les URLs ManyChat expirent après 24h - utilisez un stockage permanent

### Messages non reçus
1. Vérifiez les logs ManyChat
2. Vérifiez la table Supabase directement
3. Vérifiez les policies RLS

---

## 📞 Support

Pour toute question technique :
- Email: support@sni-gabon.com
- Dashboard: https://peppisni.netlify.app

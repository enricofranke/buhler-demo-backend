# Database Seeds

Diese Dateien enthalten Seed-Daten für die Datenbank.

## Trias Machine Seed

Die `trias-machine-seed.ts` Datei erstellt eine vollständige Trias-Maschine mit allen Konfigurationsregistern:

### Inhalt:
- **Machine Group**: "Grinding Machines" 
- **Machine**: "Trias" mit Tags (FDAD, FDAC, premium, modular)
- **Configuration Tabs**: 
  - General (Allgemeine Einstellungen)
  - Equipment (Ausrüstung und Hardware)
  - Automation (Automatisierung und Steuerung)
  - Services (Zusätzliche Services)

### Register Details:

#### General Tab:
- Consultation Value (Vorabgefüllt)
- Customer Name (Eingabefeld, Pflicht)
- Customer Country (Auswahl, Pflicht) - 19 Länder verfügbar
- Customer Language (Auswahl, Pflicht) - 9 Sprachen verfügbar
- Target Application (Auswahl, Pflicht) - 5 Kategorien

#### Equipment Tab:
- Machine Type (Auswahl, Pflicht) - 3 Trias-Varianten (300/600/800mm)
- Marking (Auswahl, Pflicht) - CE Mark, UL Mark, etc.
- Machine Design (Auswahl, Pflicht) - Open Version / Clean Room Version

#### Automation Tab:
- Control System (Auswahl, Pflicht) - Premium V5 control (vorausgewählt)
- Language Control System (Auswahl, Pflicht) - 8 Sprachen verfügbar

#### Services Tab:
- Factory Acceptance Test (Auswahl, Pflicht) - Yes/No
- Machine / Operator Training (Auswahl, Pflicht) - 3 Optionen

## Verwendung

### Trias Machine Seed ausführen:
```bash
# Option 1: Über npm script (empfohlen)
npm run seed:trias

# Option 2: Direkt mit ts-node
npx ts-node prisma/seeds/trias-machine-seed.ts
```

### Alle Seeds ausführen:
```bash
npm run seed:all
```

## Voraussetzungen

- Die Datenbank muss existieren und die Migrations müssen ausgeführt sein
- TypeScript und ts-node müssen installiert sein
- Prisma Client muss generiert sein (`npx prisma generate`)

## Fehlerbehebung

Falls Fehler auftreten:

1. **"Database not found"**: 
   ```bash
   npx prisma migrate dev
   ```

2. **"Module not found"**:
   ```bash
   npx prisma generate
   ```

3. **Duplicate key errors**: Die Seeds sind idempotent - sie können mehrfach ausgeführt werden ohne Konflikte

## Erweiterung

Um weitere Konfigurationen hinzuzufügen:

1. Neue `Configuration` erstellen
2. Entsprechende `ConfigurationOption`s hinzufügen
3. `TabConfiguration` erstellen, um die Konfiguration einem Tab zuzuweisen
4. Optional: `ConfigurationDependency` für bedingte Logik

Beispiel für eine neue Konfiguration:
```typescript
const newConfig = await prisma.configuration.create({
  data: {
    name: 'New Configuration',
    description: 'Description',
    helpText: 'Help text',
    type: 'SINGLE_CHOICE',
    isRequired: true,
    isActive: true,
  },
});

// Optionen hinzufügen
await prisma.configurationOption.create({
  data: {
    configurationId: newConfig.id,
    value: 'option_value',
    displayName: 'Option Display Name',
    isActive: true,
  },
});

// Zu Tab verknüpfen
await prisma.tabConfiguration.create({
  data: {
    tabId: targetTab.id,
    configurationId: newConfig.id,
    order: nextOrderNumber,
    isVisible: true,
  },
});
``` 
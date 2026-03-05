

# Documentacao Completa do Prototipo DiceHub (MVP)

Segue a documentacao detalhada do estado atual do prototipo, organizada conforme solicitado.

---

## 1) Mapa de Telas e Rotas

| Rota | Pagina (componente) | Objetivo | Auth? |
|------|---------------------|----------|-------|
| `/` | `HomePage` | Landing page publica com features, sistemas, planos e CTA | Nao |
| `/login` | `LoginPage` | Login e cadastro (tabs). Query param `?signup=true` abre aba de cadastro | Nao |
| `/campaigns` | `CampaignsPage` | Lista campanhas do usuario (como GM e como jogador). Filtros por sistema e busca | Sim |
| `/campaigns/new` | `CreateCampaignPage` | Wizard de criacao de campanha: nome, descricao, sistema (radio group). Gera invite_code automatico | Sim |
| `/campaigns/join` | `JoinCampaignPage` | Entrar em campanha por codigo de convite ou busca publica (RPC `get_public_campaigns`) | Sim |
| `/campaigns/:id` | `CampaignPage` | Visao da campanha: abas Visao Geral (resumo + ultimas rolagens), Membros (GM card + jogadores + pendentes), Personagens (cards + link para ficha) | Sim |
| `/campaigns/:id/gm` | `GMShieldPage` | Escudo do Mestre (somente GM): abas Dashboard, Combate, Timeline, Missoes, Anotacoes, Personagens, Homebrew, Itens Liberados | Sim (GM) |
| `/campaigns/:id/create-character` | `CreateCharacterPage` | Wizard 3 passos: Identidade (nome + classe dropdown + especializacao), Atributos (por sistema), Resumo | Sim (membro) |
| `/characters/:id` | `CharacterPage` | Ficha do personagem: abas Status (HP, CA, atributos, combate, classe), Pericias, Habilidades, Inventario, Dados Personalizados | Sim (membro) |
| `/homebrews` | `HomebrewsPage` | Lista de homebrews publicas e do usuario. Filtros por tipo e sistema | Sim |
| `/homebrews/new` | `CreateHomebrewPage` | Formulario de criacao de homebrew (item, criatura, classe, magia, raca) | Sim |
| `/homebrews/:id` | `HomebrewDetailPage` | Detalhe de uma homebrew | Sim |
| `/homebrews/:id/edit` | `CreateHomebrewPage` | Edicao de homebrew existente | Sim |
| `/profile` | `ProfilePage` | Perfil do usuario logado | Sim |
| `/users/:id` | `UserProfilePage` | Perfil publico de outro usuario (via `safe_profiles`) | Sim |
| `/admin` | `AdminPage` | Pagina administrativa (acesso controlado por `user_roles`) | Sim (admin) |

### Estados vazios e erro por tela

- **CampaignsPage**: Exibe card com icone `Gamepad2` + "Nenhuma campanha encontrada" + botoes criar/entrar
- **CampaignPage**: Se nao encontrada, exibe `AlertTriangle` + "Campanha nao encontrada" + botao voltar
- **CharacterPage**: Se nao encontrado, exibe icone `User` + "Personagem nao encontrado"
- **GMShieldPage**: Se nao GM, exibe `Lock` + "Acesso Restrito"; se campanha nao existe, exibe erro
- **HomebrewsPage**: Card com `Wand2` + "Nenhuma homebrew encontrada"
- **Todas as telas com auth**: Redirecionam para `/login` via `MainLayout` (`requireAuth=true` por padrao)
- **Loading**: Todas usam `Loader2` spinner centralizado

---

## 2) Fluxos Principais (Passo a Passo)

### 2.1 Criar conta e entrar
1. Acessar `/login` ou `/login?signup=true`
2. Preencher nome, email, senha, confirmar senha
3. `signUp()` chama `supabase.auth.signUp` com metadata `name`
4. Trigger `handle_new_user` cria automaticamente registro em `profiles` e `user_roles` (role=player)
5. Toast "Verifique seu email" (confirmacao obrigatoria)
6. Apos confirmar, login redireciona para `/campaigns`

### 2.2 Criar campanha
1. Acessar `/campaigns/new`
2. Preencher nome (obrigatorio, max 100), descricao (opcional, max 2000)
3. Selecionar sistema: 5e, Olho da Morte, Horror Cosmico (radio group visual)
4. Tema visual muda em tempo real (preview)
5. Validacao zod no front + trigger `validate_campaign_input` no banco
6. `INSERT campaigns` com `gm_id = user.id`, `invite_code` gerado (8 chars alfanumericos)
7. Trigger `ensure_campaign_gm_membership` cria membership automatica (role=gm, status=approved) com `ON CONFLICT DO UPDATE`
8. Redireciona para `/campaigns/:id`

### 2.3 Solicitar/aprovar entrada em campanha
1. Jogador acessa `/campaigns/join`
2. Opcao A: digita codigo de convite → RPC `get_campaign_by_invite_code` → `INSERT campaign_memberships` (status=pending)
3. Opcao B: busca publica → RPC `get_public_campaigns` → clica "Solicitar"
4. GM ve pendentes na aba "Membros" de `/campaigns/:id`
5. GM aprova/rejeita via mutation `UPDATE campaign_memberships SET status='approved'|'rejected'`

### 2.4 Criar ficha de personagem
1. Jogador (membro aprovado ou GM) acessa `/campaigns/:id/create-character`
2. Passo 1 - Identidade: nome + classe (dropdown de `system_classes` filtrado por sistema) + especializacao (dropdown dependente de `system_specializations`)
3. Passo 2 - Atributos: grid de inputs numericos (6 attrs para 5e/Olho da Morte, 8 para Horror) + PV + CA/Sanidade
4. Passo 3 - Resumo visual → `INSERT characters`
5. Redireciona para `/characters/:id`

### 2.5 Editar ficha (CharacterPage)
- **HP**: Stepper +/- com `onHpChange` → `UPDATE characters SET hp_current`
- **Nivel**: `LevelControl` com +/- → `UPDATE characters SET level`
- **Classe/Especializacao**: `ClassSpecializationSelector` (dropdowns) → `UPDATE characters SET class_id, specialization_id, class`
- **Atributos**: Inputs numericos → auto-save via mutation
- **CA**: Breakdown (base + attr + bonus) → `UPDATE characters SET ac`
- **Pericias**: Toggle proficiencia + bonus extra (calculado a partir de atributos). Rolagem via `INSERT dice_rolls`
- **Notas**: Textarea com save

### 2.6 Combate / Eventos de combate
- Na aba "Status" da ficha, componente `CombatEventsSection`:
  - "Receber Dano": input fixo ou formula (ex: 2d6+1), tipo de dano, observacao → `INSERT combat_stat_events` + `INSERT dice_rolls` + `UPDATE characters SET hp_current`
  - "Receber Cura": mesmo fluxo, incrementa HP (max = hp_max)

### 2.7 Iniciativa / Encontros (Escudo do Mestre)
1. GM acessa aba "Combate" no Escudo do Mestre
2. Sistema cria/reusa `combat_encounters` ativo
3. "Adicionar" abre dialog com:
   - Personagens dos jogadores (botoes, verifica se ja esta no encontro)
   - Catalogo de criaturas (busca por nome, filtrado por sistema, fonte: `mockCreatures.ts`)
4. Cada entrada = `encounter_entries` (nome, HP, iniciativa, sort_order)
5. Drag-and-drop (`@dnd-kit/core` + `@dnd-kit/sortable`) para reordenar
6. Botao "Organizar" ordena por iniciativa descendente
7. Autocomplete de desafio: gera sugestoes de criaturas por CR vs nivel medio do grupo (front-end only)
8. Ao clicar no icone "olho", mostra stat block da criatura

### 2.8 Timeline
- GM adiciona eventos via dialog: titulo, descricao, tipo (discovery/combat/npc/milestone/rest/travel), data
- `INSERT timeline_events` → renderiza cronologicamente com icones por tipo

### 2.9 Missoes
- GM cria missao: titulo, descricao, objetivos (um por linha), recompensas
- `INSERT missions` → lista com abas Ativas/Concluidas
- Botao concluir/desconcluir → `UPDATE missions SET status, completed_at`

### 2.10 Anotacoes do Mestre
- CRUD completo: `gm_notes` (titulo, conteudo)
- Somente GM da campanha (RLS)

### 2.11 Dados personalizados (Custom Rolls)
- Na aba "Dados" da ficha, `CustomRollsSection`
- Criar atalho: nome, formula (XdY+Z), tipo (ataque/teste/dano/outro), descricao
- `INSERT character_custom_rolls`
- Botao "Rolar" → calcula resultado → `INSERT dice_rolls` (roll_type do atalho)

### 2.12 Habilidades
- Na aba "Habilidades", `AbilitiesSection`
- Busca habilidades de `system_abilities` filtradas por class_id/specialization_id
- Adicionar → `INSERT character_abilities`
- Remover → `DELETE character_abilities`

### 2.13 Inventario
- Na aba "Inventario", `CharacterInventory`
- "Adicionar" abre `AddAllowedItemModal`: lista itens liberados pelo GM (`campaign_allowed_items`) + homebrews habilitados
- `INSERT character_inventory` com snapshot dos dados do item (nome, peso, raridade, dano, etc.)
- Controle de quantidade (+/-, remover se 0)
- Barra de peso (current/max) com alerta de sobrecarga

---

## 3) Permissoes e Regras

### Matriz GM vs Jogador

| Acao | GM | Jogador (membro aprovado) |
|------|-----|--------------------------|
| Criar campanha | Sim | Sim (se torna GM) |
| Editar/deletar campanha | Sim (propria) | Nao |
| Ver campanha | Sim | Sim (se membro/pendente) |
| Aprovar/rejeitar membros | Sim | Nao |
| Acessar Escudo do Mestre | Sim | Nao (exibe "Acesso Restrito") |
| Criar personagem | Sim | Sim |
| Editar qualquer ficha | Sim | Somente propria |
| Adicionar item ao inventario | Sim (qualquer) | Sim (propria ficha) |
| Adicionar habilidade | Sim (qualquer) | Sim (propria ficha) |
| Gerenciar encontros | Sim | Nao |
| Ver encontros | Sim | Sim |
| Criar missoes/timeline/notas | Sim | Nao |
| Ver missoes/timeline | Sim | Sim (via RLS) |
| Ver notas do GM | Sim | Nao |
| Criar homebrews | Sim | Sim |
| Ativar homebrew na campanha | Sim | Nao |
| Gerenciar itens liberados | Sim | Nao |
| Ver itens liberados | Sim | Sim |
| Registrar evento de combate (dano/cura) | Sim (de qualquer) | Sim (da propria ficha) |
| Rolar dados personalizados | Sim | Sim |

### Validacoes

**Front-end:**
- Nome campanha: 1-100 chars (zod + input maxLength)
- Descricao: max 2000 chars
- Senha: min 6 chars
- Senhas devem coincidir no cadastro
- Formula de dado: regex `/^(\d+)d(\d+)(?:([+-])(\d+))?$/i`
- Personagem requer nome nao vazio

**Back-end (banco):**
- Trigger `validate_campaign_input`: valida nome (1-100), descricao (max 2000), formato invite_code
- Trigger `validate_homebrew_input`: valida nome (1-100), descricao (max 5000), rarity enum
- RLS em todas as tabelas (ver secao 4)
- Unique constraint em `campaign_memberships(campaign_id, user_id)`

---

## 4) Estrutura de Dados

### Tabelas e Campos Principais

```text
profiles
├── id (uuid PK)
├── user_id (uuid, ref auth.users)
├── name (text)
├── email (text)
├── avatar_url (text?)
├── subscription_plan (enum: free|premium)
├── created_at, updated_at

user_roles
├── id (uuid PK)
├── user_id (uuid, ref auth.users)
├── role (enum: admin|moderator|player)

campaigns
├── id (uuid PK)
├── name (text)
├── description (text?)
├── system (enum: 5e|olho_da_morte|horror)
├── gm_id (uuid)
├── invite_code (text?, formato ^[A-Z0-9]{4,10}$)
├── max_players (int, default 6)
├── is_active (bool, default true)
├── created_at, updated_at

campaign_memberships
├── id (uuid PK)
├── campaign_id (uuid)
├── user_id (uuid)
├── status (enum: pending|approved|rejected)
├── role (enum: gm|player)
├── requested_at, responded_at
└── UNIQUE(campaign_id, user_id)

characters
├── id (uuid PK)
├── campaign_id (uuid)
├── user_id (uuid)
├── name (text)
├── class (text?, nome textual)
├── class_id (uuid?, ref system_classes)
├── specialization_id (uuid?, ref system_specializations)
├── level (int, default 1)
├── hp_current (int, default 10)
├── hp_max (int, default 10)
├── ac (int, default 10)
├── attributes (jsonb, default {"cha":10,"con":10,...})
├── skills (jsonb, default {})
├── weight_current, weight_max (numeric)
├── notes (text?)
├── created_at, updated_at

character_inventory
├── id (uuid PK)
├── character_id (uuid)
├── name (text)
├── item_id (text?, ref catalogo do sistema)
├── homebrew_id (uuid?, ref homebrews)
├── quantity (int, default 1)
├── weight (numeric, default 0)
├── data (jsonb: {description, rarity, type, damage, damageType, healDice, acBonus, effect, properties})

character_abilities
├── id (uuid PK)
├── character_id (uuid)
├── ability_id (uuid?, ref system_abilities)
├── homebrew_id (uuid?, ref homebrews)
├── custom_name, custom_description (text?)
├── level_acquired (int, default 1)

character_custom_rolls
├── id (uuid PK)
├── character_id (uuid)
├── name (text)
├── formula (text, ex: "1d20+5")
├── roll_type (text: attack|test|damage|other)
├── description (text?)

dice_rolls
├── id (uuid PK)
├── campaign_id (uuid)
├── user_id (uuid)
├── character_id (uuid?)
├── formula (text)
├── result (int)
├── details (text?)
├── roll_type (text: test|attack|damage|damage_taken|healing|other)
├── created_at

combat_stat_events
├── id (uuid PK)
├── campaign_id (uuid)
├── character_id (uuid)
├── event_type (text: DAMAGE_TAKEN|HEALING_DONE|DAMAGE_DEALT)
├── amount (int)
├── related_roll_id (uuid?)
├── created_at

combat_encounters
├── id (uuid PK)
├── campaign_id (uuid)
├── name (text?)
├── is_active (bool)
├── round_number (int)
├── current_turn (int)

encounter_entries
├── id (uuid PK)
├── encounter_id (uuid)
├── character_id (uuid?, link p/ jogador)
├── creature_id (text?, ref catalogo mock)
├── custom_name (text?)
├── initiative (int)
├── hp_current, hp_max (int?)
├── is_player (bool)
├── sort_order (int)

timeline_events
├── id (uuid PK)
├── campaign_id (uuid)
├── title, description (text)
├── event_date (text?)
├── event_type (text: discovery|combat|npc|milestone|rest|travel)

missions
├── id (uuid PK)
├── campaign_id (uuid)
├── title, description (text)
├── objectives (jsonb, array de strings)
├── rewards (text?)
├── status (enum: active|completed)
├── completed_at (timestamptz?)

gm_notes
├── id (uuid PK)
├── campaign_id (uuid)
├── title, content (text)
├── created_at, updated_at

homebrews
├── id (uuid PK)
├── creator_id (uuid)
├── name, description (text)
├── type (enum: item|creature|spell|class|race)
├── system (enum: 5e|olho_da_morte|horror)
├── rarity (text?)
├── data (jsonb)
├── is_public (bool)

campaign_homebrews (N:N)
├── campaign_id, homebrew_id (uuid)

campaign_allowed_items
├── campaign_id (uuid)
├── item_type (text: system|homebrew)
├── item_id (text)

system_classes
├── id (uuid PK), system (enum), name, description

system_specializations
├── id (uuid PK), class_id (uuid), name, description

system_abilities
├── id (uuid PK), class_id (uuid?), specialization_id (uuid?), name, description, level_required

safe_profiles (VIEW, SECURITY DEFINER)
├── Expoe: id, user_id, name, avatar_url, subscription_plan, created_at, updated_at
├── Exclui: email
```

### Exemplos de Payloads JSON

**`characters.attributes` (5e):**
```json
{"Forca": 16, "Destreza": 14, "Constituicao": 12, "Inteligencia": 10, "Sabedoria": 13, "Carisma": 8}
```

**`characters.skills` (Horror):**
```json
{"sanity": 45, "maxSanity": 50}
```

**`character_inventory.data`:**
```json
{
  "description": "Espada longa encantada",
  "rarity": "raro",
  "type": "weapon",
  "damage": "1d8+2",
  "damageType": "cortante",
  "acBonus": null,
  "properties": ["versatil"]
}
```

**`missions.objectives`:**
```json
["Encontrar o templo perdido", "Derrotar o guardiao", "Recuperar o artefato"]
```

---

## 5) Integracoes

### API publica de 5e
**Nao implementada no momento.** O catalogo de criaturas usa dados mock em `src/data/mockCreatures.ts` (10 criaturas hardcoded: 4 para 5e, 3 para Olho da Morte, 3 para Horror Cosmico).

O autocomplete de desafio (CR) e calculado inteiramente no front-end com base no array mock, sem persistencia. Nao ha integracao com APIs externas como `dnd5eapi.co` ou similares.

### Catalogo de itens
Itens do sistema vem de `src/data/mockItems.ts` (dados mock). Homebrews vem da tabela `homebrews`. O GM controla quais itens estao disponiveis via `campaign_allowed_items`.

### Snapshot/cache de criaturas em encontros
Atualmente, ao adicionar uma criatura ao encontro, apenas `custom_name`, `hp_current`, `hp_max` e `initiative` sao salvos em `encounter_entries`. O stat block completo e resolvido em runtime a partir do array mock `creatureCatalog` via `creature_id`. **Nao ha persistencia de snapshot** — se o dado mock mudar, o stat block muda junto.

### Comportamento quando dados mock estao indisponiveis
Nao ha fallback formal. Como os dados sao importados estaticamente no bundle, eles estao sempre disponiveis enquanto a aplicacao carrega.

---

## 6) Stack e Arquitetura

### Front-end
- **Framework**: React 18 + TypeScript
- **Build**: Vite 5
- **Roteamento**: React Router DOM v6
- **State management**: React Query (`@tanstack/react-query`) para cache de dados do servidor + `useState`/`useContext` para estado local
- **UI**: Tailwind CSS + shadcn/ui (Radix primitives) + Framer Motion (animacoes)
- **Drag-and-drop**: `@dnd-kit/core` + `@dnd-kit/sortable` (rastreador de iniciativa)
- **Formularios**: React Hook Form + Zod (validacao na criacao de campanha)
- **Tematizacao**: `ThemeContext` aplica classes CSS (`theme-medieval`, `theme-wildwest`, `theme-cosmic`) no `<html>`, trocando variaveis CSS globais

### Back-end
- **Plataforma**: Lovable Cloud (Supabase gerenciado)
- **Auth**: Supabase Auth (email + senha, confirmacao por email obrigatoria)
- **Banco**: PostgreSQL com RLS (Row Level Security) em todas as tabelas
- **Funcoes DB (SECURITY DEFINER)**: `is_campaign_gm()`, `is_campaign_member()`, `has_campaign_access()`, `is_same_campaign_member()`, `is_admin()`, `get_public_campaigns()`, `get_campaign_by_invite_code()`, `handle_new_user()`, `ensure_campaign_gm_membership()`, `validate_campaign_input()`, `validate_homebrew_input()`
- **Edge Functions**: Nenhuma implementada no momento

### Drag-and-drop (implementacao)
Usa `@dnd-kit/core` (`DndContext`, `closestCenter`) + `@dnd-kit/sortable` (`SortableContext`, `verticalListSortingStrategy`, `useSortable`). Cada `encounter_entry` tem campo `sort_order`. No `onDragEnd`, chama `arrayMove()` e faz batch `UPDATE` no `sort_order` de cada entry.

### Log de rolagens (implementacao)
Cada rolagem (pericia, custom roll, evento de combate) faz `INSERT` na tabela `dice_rolls` com `campaign_id`, `user_id`, `character_id`, `formula`, `result`, `details`, `roll_type`. O sidebar `RollsSidebar` consome via React Query (`campaign-dice-rolls`) limitado a 50 ultimas.

---

## 7) Pendencias, Limitacoes e Bugs Conhecidos

### Funcionalidades nao prontas no MVP
1. **Integracao com API publica de D&D 5e (SRD)**: Criaturas vem de mock. Nao ha chamada HTTP nem cache/snapshot real
2. **Snapshot de criaturas nos encontros**: `encounter_entries` nao salva stat block completo, apenas referencia o ID mock
3. **Admin Console**: Pagina `/admin` existe mas nao esta funcional para o MVP
4. **Compendio interno**: Nao existe. Tabelas `system_classes`, `system_specializations`, `system_abilities` existem mas provavelmente estao vazias — dependem de seeds/migrations para popular dados
5. **Auto-progressao de habilidades por nivel**: Infraestrutura existe (`system_abilities.level_required`) mas nao ha logica automatica de sugestao ao subir de nivel
6. **Planos Free/Premium**: Exibidos no landing page mas nao ha logica de limite ou paywall implementada
7. **Upload de avatar**: Campo `avatar_url` existe mas nao ha storage bucket configurado nem UI de upload

### Bugs conhecidos / riscos
1. **Tabelas `system_classes`/`system_specializations` possivelmente vazias**: Se nao houve seed, dropdowns de classe aparecerao vazios e o componente retorna `null`
2. **Criaturas do mock usam `system: 'autoral'` mas o banco usa `system: 'olho_da_morte'`**: O filtro em `GMCombatTab` compara com `system` da campanha — se nao houver mapeamento, criaturas do Olho da Morte podem nao aparecer
3. **Inventario depende de `campaign_allowed_items`**: Se o GM nao liberou nenhum item, o jogador nao consegue adicionar nada
4. **`safe_profiles` view pode nao retornar perfis de outros usuarios dependendo da RLS**: A view usa `auth.uid()` e `is_same_campaign_member()` — se o usuario nao compartilha campanha com o alvo, nao vera o perfil
5. **Rolagens de sidebar nao mostram nome do jogador na CampaignPage**: O componente `RollsSidebar` aceita prop `profiles` mas a `CampaignPage` nao passa essa prop
6. **Memberships SELECT policy restritiva**: `WHERE user_id = auth.uid() OR is_campaign_gm(campaign_id)` — jogadores comuns nao veem outros membros, somente seus proprios registros. Isso pode causar lista de membros incompleta na visao do jogador

### Proximos passos recomendados
1. Popular `system_classes`, `system_specializations` e `system_abilities` com dados seed para os 3 sistemas
2. Integrar API publica de D&D 5e (`https://www.dnd5eapi.co`) para autocomplete de criaturas no modo 5e_SRD, salvando snapshot em `encounter_entries.data` (jsonb)
3. Implementar fallback quando API externa estiver indisponivel (usar cache local ou mock)
4. Ajustar RLS de `campaign_memberships` para permitir que membros aprovados vejam outros membros da mesma campanha
5. Testar fluxo end-to-end com dados reais: criacao de campanha → entrada → criacao de ficha → encontro → rolagens → dashboard do GM
6. Implementar storage bucket para avatares de usuario e personagem
7. Adicionar paginacao nas queries que podem crescer (dice_rolls, timeline_events)


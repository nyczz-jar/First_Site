# Sistema de Autenticação - Koenigsegg Store

## Visão Geral

Sistema completo de login com:
- ✅ Modal popup de login (sem redirecionamento)
- ✅ Validação de campos (email/telefone e senha obrigatórios)
- ✅ Armazenamento de sessão via localStorage
- ✅ Proteção de páginas (redirecionamento para login se não autenticado)
- ✅ Botão de logout na navbar
- ✅ Integração preparada para PHP/banco de dados

---

## Estrutura de Arquivos

```
Projeto Koenigsegg/
├── login.html              # Página de login (modal popup)
├── index.html              # Página protegida (requer autenticação)
├── js/
│   ├── auth.js            # Lógica de autenticação (frontend)
│   └── main.js            # Scripts do site
├── api/
│   ├── login.php          # Endpoint de login (POST)
│   └── validate.php       # Endpoint de validação de token (POST)
├── css/
│   └── style.css
└── ...
```

---

## Fluxo de Autenticação

### 1. Usuário tenta acessar o site

```
User acessa index.html
        ↓
requireAuth() executa (em auth.js)
        ↓
isAuthenticated() verifica localStorage
        ↓
Token não existe? → Redireciona para login.html
Token existe e válido? → Acesso liberado
```

### 2. Usuário faz login

```
User preenche Email/Telefone e Senha em login.html
        ↓
Clica "LOGIN"
        ↓
handleLogin() valida campos (verificar vazios)
        ↓
Se inválido: Mostra erro
Se válido: Envia POST para /api/login.php
        ↓
Backend valida credenciais
        ↓
Se correto: Retorna token
Se errado: Retorna erro
        ↓
Se sucesso: Salva em localStorage
        ↓
Redireciona para index.html (com autenticação)
```

### 3. Usuário faz logout

```
User clica "Logout" na navbar
        ↓
handleLogout() solicita confirmação
        ↓
Se confirmado:
  - logout() limpa localStorage
  - Redireciona para login.html
```

---

## Como Usar - Teste Local (Modo Demo)

### Usuários de Teste

Por padrão, o sistema vem com validação local (sem PHP). Usuários válidos:

| Email | Telefone | Senha |
|-------|----------|-------|
| `admin@koenigsegg.com` | - | `admin123` |
| `user@koenigsegg.com` | `11912345678` | `senha123` |

### Teste Passo a Passo

1. **Abra `login.html`** no navegador (ou acesse index.html)
2. **Campo vazio**: Clique "LOGIN" sem preencher campos → Mostra erro
3. **Email/Telefone inválido**: Digite "texto123" → Mostra erro
4. **Credenciais corretas**: 
   - Email: `admin@koenigsegg.com`
   - Senha: `admin123`
   - Clique "LOGIN" → Redireciona para index.html
5. **Acesso protegido**: Depois do login, index.html mostra "Olá, admin"
6. **Logout**: Clique "Logout" → Retorna para login.html

---

## Integração com PHP e Banco de Dados

### Passo 1: Ativar Backend no Frontend

Abra `js/auth.js` e mude a função `isUsingBackend()`:

```javascript
// Em js/auth.js, procure por:
function isUsingBackend() {
    // Mude para true quando estiver usando seu PHP backend
    return false;  // ← Mude para true
}
```

### Passo 2: Configurar Conexão com Banco

Abra `api/login.php` e descomente a seção de banco de dados:

```php
// Encontre este código comentado e descomente:
try {
    $pdo = new PDO('mysql:host=localhost;dbname=koenigsegg', 'root', '');
    // ... resto do código
}
```

### Passo 3: Criar Tabela no Banco de Dados

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    token VARCHAR(255),
    token_expires DATETIME,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuários de teste
INSERT INTO users (nome, email, phone, password) VALUES 
(
    'Admin',
    'admin@koenigsegg.com',
    NULL,
    '$2y$10$...' -- password_hash('admin123', PASSWORD_BCRYPT)
),
(
    'João Silva',
    'joao@koenigsegg.com',
    '11912345678',
    '$2y$10$...' -- password_hash('senha123', PASSWORD_BCRYPT)
);
```

**Como gerar hash da senha em PHP:**

```php
<?php
$password = 'admin123';
$hash = password_hash($password, PASSWORD_BCRYPT);
echo $hash; // Copie este valor para o INSERT
?>
```

### Passo 4: Implementar Lógica de Autenticação

Em `api/login.php`, descomente a seção de banco de dados e implemente:

```php
// Substitua a validação local por:
$stmt = $pdo->prepare("SELECT id, email, phone, password FROM users WHERE email = ? OR phone = ?");
$stmt->execute([$email, $normalizedPhone]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Email ou senha incorretos']);
    exit();
}

// Sucesso
$token = bin2hex(random_bytes(32));
echo json_encode(['success' => true, 'token' => $token, 'userId' => $user['id']]);
```

### Passo 5: Adicionar Validação de Sessão (Opcional)

Se quiser validar token no servidor, use `api/validate.php`:

```php
// Validar token em suas páginas PHP:
$token = $_POST['token'] ?? $_GET['token'] ?? '';

// Fazer POST para validate.php
$ch = curl_init('api/validate.php');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['token' => $token]));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = json_decode(curl_exec($ch));

if (!$result->valid) {
    header('Location: login.html');
    exit();
}
```

---

## Variáveis de Autenticação (localStorage)

Após login bem-sucedido, `localStorage` armazena:

```json
{
    "authToken": {
        "email": "admin@koenigsegg.com",
        "token": "token_abc123xyz",
        "userId": 1,
        "timestamp": 1700000000000
    }
}
```

**Como acessar no frontend:**

```javascript
const auth = getAuth(); // Retorna objeto authToken
console.log(auth.email);   // "admin@koenigsegg.com"
console.log(auth.token);   // "token_abc123xyz"
console.log(auth.userId);  // 1
```

---

## Funções Disponíveis em auth.js

| Função | Descrição | Retorno |
|--------|-----------|---------|
| `requireAuth()` | Redireciona para login se não autenticado | void |
| `isAuthenticated()` | Verifica se existe token válido | boolean |
| `getAuth()` | Recupera dados de autenticação | object \| null |
| `storeAuth(data)` | Salva dados de autenticação | void |
| `logout()` | Remove autenticação | void |
| `handleLogin(event)` | Processa submit do formulário | async void |
| `validateForm()` | Valida campos vazios | boolean |

---

## Proteção de Outras Páginas

Para proteger outras páginas (news.html, contact.html, etc), adicione isso no `<head>`:

```html
<head>
    <!-- ... outros elementos ... -->
    <script src="js/auth.js"></script>
    <script>
        requireAuth();
    </script>
</head>
```

---

## Segurança - Checklist

- ✅ Senhas com hash (use `password_hash()` em PHP)
- ✅ HTTPS em produção (importante!)
- ✅ Validação no frontend (UX) e backend (segurança)
- ✅ Token com expiração (implementado: 24 horas)
- ✅ CORS configurado em api/ (localhost)
- ⚠️ **TODO em Produção**:
  - Remova usuários de teste (validateLocalUser)
  - Configure HTTPS/SSL
  - Use JWT para tokens (não string simples)
  - Implemente rate limiting (tentar login muitas vezes)
  - Adicione 2FA (autenticação em dois fatores)

---

## Troubleshooting

### Login não funciona mesmo com credenciais corretas

**Solução**: 
1. Abra browser DevTools (F12)
2. Vá para Console → veja mensagens de erro
3. Verifique localStorage: `localStorage.getItem('authToken')`
4. Verifique se `isUsingBackend()` retorna o valor correto

### Usuário redireciona para login logo depois de fazer login

**Solução**:
1. Verifique se token está sendo salvo: `console.log(getAuth())`
2. Verifique duração de expiração (EXPIRY_HOURS em auth.js)
3. Se usar backend, verifique se API retorna `success: true`

### PHP retorna erro 500

**Solução**:
1. Verifique `error_log()` do servidor
2. Verifique conexão com banco de dados
3. Confirme que PDO está instalado (`php -m | grep pdo`)
4. Verifique permissões de arquivo

### CORS error no console

**Solução**:
1. Confirme que headers CORS estão em api/login.php
2. Teste com `curl` do servidor: `curl -X POST http://localhost/api/login.php -d '{"email":"admin@koenigsegg.com"}'`
3. Se usar PHP, configure `Access-Control-Allow-Origin: *` (ou seu domínio)

---

## Personalizações

### Alterar Duração de Sessão

Em `js/auth.js`, procure:

```javascript
const EXPIRY_HOURS = 24; // Mude este valor
```

### Alterar URL da API

Em `js/auth.js`, procure:

```javascript
const API_CONFIG = {
    loginEndpoint: 'api/login.php', // Mude aqui
    validateEndpoint: 'api/validate.php'
};
```

### Alterar Mensagens de Erro

Em `js/auth.js`, procure as funções `showAlert()` e personalize as mensagens.

---

## Suporte

Para dúvidas sobre integração ou customização, consulte os comentários nos arquivos:

- `login.html` - Estrutura do formulário
- `js/auth.js` - Lógica de autenticação (bem comentada)
- `api/login.php` - Endpoint de login com exemplos
- `api/validate.php` - Validação de token

---

**Versão**: 1.0  
**Criado em**: 2025  
**Última atualização**: 2025-11-18

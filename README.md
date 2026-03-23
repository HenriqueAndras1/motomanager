# 🏍️ Moto Manager

Aplicativo para gerenciamento de manutenções de moto, controle de alertas e organização geral.

---

## 🚀 Tecnologias

* React Native (Expo)
* Expo Router
* TypeScript
* React Native Paper
* Expo Updates (OTA)

---

## 📱 Funcionalidades

* Cadastro de moto
* Controle de manutenções
* Sistema de alertas
* Tema claro/escuro automático
* Atualização automática (OTA)
* Atualização obrigatória com bloqueio de versão

---

## ⚙️ Configuração do Projeto

### 📥 Instalar dependências

```bash
npm install
```

---

### ▶️ Rodar projeto (desenvolvimento)

```bash
npx expo start
```

---

### 🌐 Rodar no navegador (web)

```bash
npx expo start --web
```

---

## 📦 Build do App

### 🔧 Login no Expo (caso necessário)

```bash
npx expo login
```

---

### 📱 Gerar APK (instalar no celular)

```bash
npx eas build -p android --profile production
```

> ⚠️ Use sempre `production` para garantir compatibilidade com OTA.

---

### 🏗️ Gerar versão de produção (AAB - Play Store)

```bash
npx eas build -p android --profile production
```

---

## 🔄 Atualização do App (OTA)

O app utiliza **Expo Updates**, permitindo atualizar o app sem reinstalar.

---

### 🚀 Enviar atualização

```bash
npx eas update --branch production
```

---

### 📡 Canal utilizado

* `production` → versão oficial do app

> ⚠️ O build e o update devem usar o **mesmo canal**, senão o OTA não funciona corretamente.

---

### 📱 Como funciona a atualização

1. Você altera o código
2. Executa:

```bash
npx eas update --branch production
```

3. O app no celular:

* verifica atualização automaticamente
* inicia download
* exibe tela de carregamento com progresso
* aplica atualização automaticamente
* reinicia com a nova versão

---

## 🧠 Fluxo de Atualização

* Verificação automática ao abrir o app
* Download com barra de progresso (UX melhorada)
* Aplicação automática
* Reinício automático
* Fallback com modal (caso necessário)

---

## 📂 Estrutura do Projeto

```
app/
 ├── (abas)/
 ├── _layout.tsx

src/
 ├── contextos/
 ├── utils/
```

---

## 🎨 Tema

* Suporte a modo claro e escuro
* Cores personalizadas
* Layout consistente

---

## 🔒 Atualização Obrigatória

O app possui sistema de:

* Verificação automática de atualização
* Bloqueio de uso em versões antigas
* Atualização forçada quando necessário
* Integração com APK externo

---

## 👨‍💻 Autor

**Henrique Andras**

---

## 🚀 Status

🟢 Em desenvolvimento / uso pessoal

---

## 💡 Futuras melhorias

* Histórico detalhado de manutenções
* Backup em nuvem
* Notificações inteligentes
* Melhorias de UX
* Integração com API

---

## ⚡ Dicas importantes

* Sempre testar OTA após alterações:

```bash
npx eas update --branch production
```

* OTA NÃO altera código nativo
* Para mudanças grandes, gere novo APK
* Após alterar `runtimeVersion`, é obrigatório gerar novo build

---

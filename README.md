# FIFA Collections Helper 🏆

App web para gerenciar sua coleção de figurinhas da Copa do Mundo. Escaneie as figurinhas usando a câmera do celular e acompanhe quais você já tem!

## 🚀 Funcionalidades

- 📷 **Escaneamento via Câmera**: Use a câmera do celular para escanear o código na parte de trás das figurinhas (ex: BRA12, ARG10)
- 🔍 **Detecção de Repetidas**: O app avisa automaticamente quando você escaneia uma figurinha que já existe
- 📊 **Estatísticas**: Veja quantas figurinhas você tem no total, quantas são únicas e quantas são repetidas
- 🔍 **Busca**: Filtre sua coleção por código ou número
- 📱 **Design Mobile-First**: Interface otimizada para uso no celular

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Banco de Dados**: Supabase (PostgreSQL)
- **OCR**: Tesseract.js para reconhecimento de texto
- **Estilização**: Tailwind CSS
- **Hospedagem**: Vercel

## 📋 Pré-requisitos

- Node.js 18+
- Conta no Supabase
- Conta na Vercel (para deploy)

## 🔧 Configuração

### 1. Clone o projeto

```bash
git clone <seu-repo>
cd fifa-collections-helper
```

### 2. Configure o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Vá para **SQL Editor** no painel do Supabase
3. Copie o conteúdo do arquivo `supabase/schema.sql` e execute
4. Vá para **Settings > API**
5. Copie a **Project URL** e a **anon public key**

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

Edite o `.env.local` com suas credenciais:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

### 4. Instale as dependências

```bash
npm install
```

### 5. Execute localmente

```bash
npm run dev
```

Acesse `http://localhost:3000`

## ☁️ Deploy na Vercel

1. Faça push do código para o GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy automático!

## 📱 Como Usar

1. **Abra o app** no celular
2. **Permita acesso à câmera** quando solicitado
3. **Aponte a câmera** para o código na parte de trás da figurinha (ex: BRA12)
4. **Aguarde a detecção** - o app vai vibrar e mostrar uma notificação
5. **Veja o resultado** - figurinha nova (verde) ou repetida (vermelho)
6. **Acesse a aba "Coleção"** para ver todas as figurinhas salvas

## 🎨 Códigos de Exemplo

Os códigos das figurinhas seguem o padrão:
- 2-3 letras (sigla do país) + 1-2 dígitos (número)
- Exemplos: BRA12, ARG10, FRA7, GER1, ENG23

## 📁 Estrutura do Projeto

```
fifa-collections-helper/
├── app/
│   ├── scanner/page.tsx    # Página do scanner
│   ├── collection/page.tsx # Página da coleção
│   ├── layout.tsx          # Layout principal
│   └── globals.css         # Estilos globais
├── components/
│   ├── CameraScanner.tsx   # Componente de câmera + OCR
│   ├── StickerCard.tsx     # Card de figurinha
│   ├── BottomNav.tsx       # Navegação inferior
│   └── Stats.tsx           # Estatísticas
├── lib/
│   ├── supabase.ts         # Cliente Supabase
│   └── ocr.ts              # Funções de OCR
├── types/
│   └── index.ts            # Tipos TypeScript
└── supabase/
    └── schema.sql          # Schema do banco de dados
```

## 📄 Licença

MIT
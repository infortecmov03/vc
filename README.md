# Bazar Moçambique AI

Bem-vindo ao Bazar Moçambique AI, uma plataforma de e-commerce moderna construída com Next.js, Firebase e Genkit para funcionalidades de IA.

## Funcionalidades

- **Listagem de Produtos:** Navegue por produtos organizados por categorias.
- **Busca Inteligente:** Encontre produtos usando linguagem natural com o poder da IA (Genkit).
- **Recomendações com IA:** Receba sugestões de produtos com base no seu histórico de navegação.
- **Carrinho de Compras:** Adicione produtos e finalize a compra de forma simples.
- **Autenticação de Usuários:** Crie uma conta ou faça login para acessar seu perfil.
- **Integração com Firebase:** Pedidos e dados de usuários são salvos no Firestore.

## Stack Tecnológica

- **Framework:** [Next.js](https://nextjs.org/) (usando App Router)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com [ShadCN/UI](https://ui.shadcn.com/) para componentes.
- **Backend & Banco de Dados:** [Firebase](https://firebase.google.com/) (Firestore para banco de dados, Authentication para usuários).
- **Inteligência Artificial:** [Genkit (Firebase GenAI Stack)](https://firebase.google.com/docs/genai)
- **Ícones:** [Lucide React](https://lucide.dev/)

---

## Primeiros Passos

Siga estas instruções para configurar e rodar o projeto em seu ambiente de desenvolvimento local.

### 1. Pré-requisitos

- [Node.js](https://nodejs.org/en) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)

### 2. Clonar o Repositório

Primeiro, clone o repositório do GitHub para sua máquina local:

```bash
git clone https://github.com/infortecmov03/BazarMoz.git
cd BazarMoz
```

### 3. Instalar as Dependências

Instale todas as dependências do projeto usando npm (ou seu gerenciador de pacotes preferido):

```bash
npm install
```

### 4. Configurar as Variáveis de Ambiente do Firebase

Para que o aplicativo se conecte corretamente ao Firebase, você precisa fornecer suas chaves de API.

1.  Crie um arquivo chamado `.env` na raiz do seu projeto.
2.  Copie o conteúdo do arquivo `.env.example` e cole no `.env`.
3.  Substitua os valores de placeholder (`your_...`) pelas credenciais do seu projeto Firebase.

O seu arquivo `.env` deve se parecer com isto:

```
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Genkit (Google AI)
GEMINI_API_KEY=your_gemini_api_key
```

> **Onde encontrar as credenciais do Firebase?**
>
> 1.  Vá para o [Console do Firebase](https://console.firebase.google.com/).
> 2.  Selecione seu projeto.
> 3.  Clique no ícone de engrenagem (Configurações do Projeto) no canto superior esquerdo.
> 4.  Na aba "Geral", role para baixo até "Seus apps".
> 5.  Selecione seu aplicativo da web e você verá um objeto `firebaseConfig`. As chaves de que você precisa estão lá.
>
> **Onde encontrar a chave da API do Gemini?**
>
> 1.  Acesse o [Google AI Studio](https://aistudio.google.com/).
> 2.  Clique em "Get API key" no menu à esquerda.
> 3.  Crie ou copie sua chave de API.

### 5. Rodar o Aplicativo de Desenvolvimento

Com tudo configurado, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O aplicativo estará disponível em [http://localhost:9002](http://localhost:9002).

---

## Scripts Disponíveis

-   `npm run dev`: Inicia o servidor de desenvolvimento do Next.js.
-   `npm run build`: Compila o aplicativo para produção.
-   `npm run start`: Inicia o servidor de produção do Next.js.
-   `npm run lint`: Executa o linter para verificar a qualidade do código.
-   `npm run genkit:dev`: Inicia o servidor de desenvolvimento do Genkit para testar os fluxos de IA.

## Estrutura do Projeto

-   `/src/app`: Contém as páginas e layouts do Next.js App Router.
-   `/src/components`: Componentes React reutilizáveis, incluindo os da ShadCN/UI.
-   `/src/contexts`: Provedores de contexto React (ex: Carrinho de Compras).
-   `/src/firebase`: Configuração e hooks para interagir com o Firebase.
-   `/src/ai`: Lógica relacionada à IA, incluindo fluxos do Genkit.
-   `/src/lib`: Funções utilitárias, definições de tipos e dados estáticos.

---

Este projeto foi gerado e modificado com a ajuda do **Firebase Studio**.
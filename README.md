# UHP - Plano de Ação do Licenciamento Sanitário

Painel HTML para acompanhar os documentos exigidos no processo de licenciamento sanitário, com status, responsável, prazos, resumo do documento e evidências digitais.

## Estrutura

- `index.html`: aplicação completa em HTML/CSS/JS.
- Supabase Database: tabela `public.uhp_action_plan` com 23 itens do checklist.
- Supabase Storage: bucket privado `uhp-evidencias` para armazenar os arquivos anexados.
- Supabase Database: tabela `public.uhp_evidencias` para registrar nome, tamanho, tipo e vínculo de cada arquivo com o item do plano de ação.
- Supabase Edge Function `uhp-admin-api`: autenticação do usuário administrativo, leitura e edição do plano, upload e acesso temporário aos arquivos.

## Segurança

As evidências ficam em bucket privado no Supabase Storage. Não existe link público permanente para os documentos. O acesso aos arquivos é feito pelo backend após validação da sessão administrativa.

## Publicação no Netlify

Conecte este repositório ao Netlify e use a branch `main`. O projeto é estático, sem comando de build. A publicação deve usar a raiz do repositório, onde está o `index.html`. Após conectado, cada push na `main` gera um novo deploy automaticamente.

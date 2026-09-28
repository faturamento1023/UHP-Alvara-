# UHP - Plano de Ação do Licenciamento Sanitário

Painel HTML para acompanhar os documentos exigidos no processo de licenciamento sanitário, com status, responsável, prazos, resumo do documento e acesso às pastas de evidências no Google Drive.

## Estrutura

- `index.html`: aplicação completa em HTML/CSS/JS.
- `netlify.toml`: configuração para publicação no Netlify.
- Supabase: tabela `public.uhp_action_plan` com 23 itens do checklist e políticas RLS.
- Google Drive: cada item do plano aponta para a pasta de evidências correspondente, armazenada apenas no banco.

## Segurança

Os links do Google Drive não ficam gravados no repositório público. Eles são lidos do Supabase somente após autenticação. A chave usada no frontend é a chave publicável do Supabase; as políticas RLS limitam a leitura e edição aos usuários autenticados.

## Publicação no Netlify

Conecte este repositório ao Netlify e use a branch `main`. Não há comando de build; a pasta publicada é a raiz do repositório (`.`). Após conectado, cada push na `main` gera um novo deploy automaticamente.

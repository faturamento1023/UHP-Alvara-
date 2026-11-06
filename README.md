# Clínica Med Center — portfólio institucional

Portfólio público da Clínica Med Center Ltda (CNPJ 23.059.179/0001-58). Projeto independente do sistema Ações Med Center.

## Arquivos
- index.html: página institucional e SEO.
- assets/site.css: visual responsivo.
- assets/site.js: menu e galeria.
- assets/logo.webp e assets/favicon.png: marca original.
- media.json: catálogo dos registros reais.

## Mídia dos dois Instagrams
Perfis: https://www.instagram.com/medcenter.saudeemacao/ e https://www.instagram.com/med.center5/ .
As fotos e os vídeos reais foram recebidos diretamente da empresa e estão salvos em assets/media/. O arquivo media.json contém a curadoria da galeria, e o fluxo GitHub Actions extrai o pacote de mídia versionado em media-chunks/. Os perfis oficiais foram mantidos como referência e links de navegação.

Exemplo:
    { "media": [ { "type":"foto", "src":"assets/media/acao-01.webp", "title":"Ação de saúde" }, { "type":"video", "src":"assets/media/acao-02.mp4", "title":"Nosso trabalho" } ] }

## Hospedagem
Site estático sem build. No GitHub Pages, configurar Settings > Pages > Deploy from a branch > main / (root), se necessário. Integrações de hospedagem existentes podem atualizar automaticamente.

## Histórico
Os arquivos anteriores do repositório UHP-Alvara- deixam de integrar a branch main na nova versão; são recuperáveis pelo histórico Git.

Ao inserir fotografias de pacientes, equipes ou atendimentos, confirmar a autorização de publicação e o respeito à privacidade.

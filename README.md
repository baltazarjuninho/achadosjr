AchadosJR — Deploy Cloudflare (Pages + Worker)

1) Criar repositório no GitHub (ex: achadosjr) e enviar arquivos:
   - index.html, admin.html, script.js, admin.js, style.css
   - pasta worker/expand.js (Worker code)
   - (opcional) worker/wrangler.toml

2) Cloudflare - Worker
   - Acesse Cloudflare Dashboard -> Workers -> Create Worker
   - Cole o código de `worker/expand.js`
   - Criar KV Namespace:
      Workers & Pages -> KV -> Create Namespace -> nome: PRODUCTS
   - No Worker: Settings -> Add binding -> Variable name: PRODUCTS -> selecione o namespace
   - Deploy do Worker (Save & Deploy)
   - copie a URL do Worker (ex: https://achadosjr-api.workers.dev)

3) Atualizar front-end:
   - No `script.js` e `admin.js` substitua WORKER_URL_PLACEHOLDER pela URL do Worker.

4) Cloudflare Pages (site estático)
   - Dashboard -> Pages -> Create a project -> Connect to GitHub -> selecione repo `achadosjr`
   - Build settings: Framework: None, Build command: (vazio), Build output folder: `/`
   - Deploy (Cloudflare fará o deploy)

5) Teste:
   - Admin: https://<your-site>.pages.dev/admin.html
     Senha: admin123
     Cole link afiliado (p.ex. seu /sec/...) -> Adicionar
   - Home: https://<your-site>.pages.dev

Observações:
- Se houver erro "ID não encontrado" tente colar o link final (abra o /sec/ no navegador e copie o URL final) — mas Worker já tenta seguir redirecionamento.
- Para produção você pode trocar a senha fixa por um segredo (Workers Secret + Pages secret) depois.

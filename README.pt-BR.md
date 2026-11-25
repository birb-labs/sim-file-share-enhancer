# Sim File Share Enhancer

Idiomas: [English](README.md) | **Portugues (BR)** | [Espanol](README.es.md)

Um userscript que adiciona tema moderno, filtros, ordenacao, coluna de criadores e selecao em massa segura ao [Sim File Share](https://simfileshare.net).

## Instalacao

1. Instale um gerenciador de userscripts, como Tampermonkey ou Violentmonkey.
2. Abra o instalador: [simfileshare-enhancer.user.js](https://raw.githubusercontent.com/birb-labs/sim-file-share-enhancer/main/simfileshare-enhancer.user.js)
3. Confirme a instalacao. O script se atualiza sozinho a partir do mesmo endereco.

## Recursos

- Temas claro, escuro e automatico.
- Filtros por nome, tipo, tamanho, data e criador, e ordenacao em todas as colunas.
- Coluna de criadores com um chip por criador. Ao clicar, abre um popup com os links oficiais (Patreon, Tumblr, site proprio e outros).
- Selecao em intervalo com Shift e barra de acoes em massa.
- Exportar hashes: le o MD5 de cada arquivo a partir do ETag do servidor, sem baixar o arquivo.

## Banco de dados

Os bancos de criadores e de mods sao arquivos JSON em [`data/`](data) e sao carregados deste repositorio, entao podem ser atualizados sem reinstalar o script. O script guarda uma copia em cache por seis horas.

- [`data/creators.json`](data/creators.json): criadores, padroes de nome, links oficiais e foto.
- [`data/mods.json`](data/mods.json): uma entrada por arquivo, identificada pelo MD5.

Arquivos enviados em partes (geralmente os maiores) nao trazem MD5 no ETag do servidor. A entrada guarda o ETag no campo `etag` e `md5` fica `null`. O mesmo MD5 pode aparecer com nomes diferentes, entao as entradas sao localizadas primeiro pelo nome do arquivo.

Para contribuir, use **Exportar hashes** na sua lista de arquivos, complete criadores, categoria e imagem no JSON gerado e abra um pull request.

## Desenvolvimento

```sh
npm install
npm test      # gera o build e roda os testes
npm run build # gera simfileshare-enhancer.user.js a partir de src/
```

Edite os modulos em `src/`. O `simfileshare-enhancer.user.js` da raiz e gerado e versionado porque e o instalador.

## Licenca

MIT. Criado por Birb Labs, contato@birblabs.com.

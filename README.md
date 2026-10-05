# Desafio DevSecOps — Gerenciador de Tarefas

## Sobre o Projeto
Este repositório faz parte do desafio prático do módulo de DevSecOps da ADA Tech.
Você receberá este projeto com vulnerabilidades propositais e uma pipeline incompleta.
Seu objetivo é **implementar a pipeline de segurança** e **corrigir as vulnerabilidades**.

## Estado atual
A pipeline está **incompleta**. Os steps de segurança precisam ser implementados por você.

## Sua missão
1. Implementar os steps de segurança no `pipeline.yml`
2. Fazer a pipeline **quebrar** ao detectar os problemas
3. Corrigir as vulnerabilidades encontradas
4. Fazer a pipeline **passar** com tudo verde ✅
5. Documentar o funcionamento da pipeline neste README

## O que implementar
- [ ] Secrets Scanning com **Gitleaks**
- [ ] SAST com **Semgrep**
- [ ] SCA com **Grype**
- [ ] Assinatura do artefato com cosign
- [ ] Deploy com **GitHub Pages**

## Como a pipeline funciona
> Análise Inicial
Análise STRIDE framework 
•	S – Spoofing (Falsificação / Fingimento): 
o	    Risco de falsificação/fingimento de ser outro usuário pela posse das credenciais API_KEY e DB_PASSWORD exportas no código
•	T – Tampering (Adulteração / Violação): 
o	    Risco de manipulação das tarefas nesta aplicação por usuário não autorizado
•	R – Repudiation (Repúdio): 
•	I – Information Disclosure (Divulgação de Informação): 
o	    Risco de vazamento das credenciais API_KEY e DB_PASSWORD pois estão disponíveis no repositório github não privado
•	D – Denial of Service (Negação de Serviço): 
o	    Risco de queda de serviço por falta de rate limit da aplicação vulnerável a ataques DDoS

Análise Inicial de Ferramentas de Extensões de Segurança

Terminal
Problems:
{"error":"Failed to get dependencies for all 1 potential projects.\n\nc:\\Users\\user\\Desktop\\devsecops-desafio\\projeto-devsecop-desafio\\package.json:\nMissing node_modules folder: we can't test without dependencies.\nPlease run 'npm install' first.","path":"c:\\Users\\user\\Desktop\\devsecops-desafio"}
Análise Extensão Sonarqube

"API_KEY" detected here, make sure this is not a hard-coded secret. Sonarqube ln1, col17
Exemplo: 
const API_KEY = "1234567890abcdef"  // Noncompliant

const response = await fetch("https://api.my-service/v1/users", {
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  },
});

const API_KEY = process.env.API_KEY;

const response = await fetch("https://api.my-service/v1/users", {
  headers: {
    Authorization: `Bearer ${API_KEY}`,
  },
});

Make sure that this dynamic injection or execution of code is safe. Sonarqube ln29, col5

Extensão Snyk – Análise
Open source – 54 issues: 2 critical, 20 high, 30 medium, 2low
package.json: 
- axios@0.21.1 crítica
- body-parser@1.19.0 alta
-lodash@4.17.4 alta
-qs@6.7.0 alta
-express@4.17.1 média
-path-to-regexp@0.1.7
-send@0.17.1 baixa

Extensão GitGuardian – Análise
Findings > No secrets detected yet
#1 commit: cc1ee93e7cc17072bade95cb2e9a2a526605b442
> Descreva cada step, o que ele faz e por que ele é importante para a segurança.
* criar chaves no repositório API_KEY e DB_PASSWORD para a segurança da aplicação, evitando vazamentos e usos indevidos
* na fase gitleaks irá verificar se existem chaves expostas e usando o princípio shift left impediria o prosseguimento do pipeline abortando o job
* sonarqube não acusou mais credencial exposta
#2 commit: 128bdc824d32ec061fc17f0ceefbc94c48c4d35d
GitHub Actions
Status  Duração Artefatos
FALHA   25s     2
-Set up job                  [ok]
-Baixar o artefato assinado  [ok]
-Instalar Cosign             [ok]
-Extrair site verificado     [ok]
-Configurar GitHub Pages     [X]

Resumo de Construção, Segurança e Assinatura
Nenhum vazamento detectado

*inclusão do semgrep
Terminal:  docker run --rm -v "${PWD}:/src" semgrep/semgrep semgrep scan --config auto --config p/xss --error .
Scan Status
Scanning 4 files tracked by git with 1067 code rules:
Scanning 4 files tracked by git with 1076 Code rules:

  Language      Rules   Files          Origin      Rules
 ─────────────────────────────        ───────────────────
  <multilang>      60       4          Community    1076
  js              154       1
  json              4       1
  html              1       1

em src/script.js
Javascript.browser.security.eval-detected.eval-detected
<<Blocking>>
Detected the use of eval(). eval() can be dangerous if used to evaluate dynamic contente. If this 
│ Scan Summary │
✅ Scan completed successfully.
 • Findings: 1 (1 blocking)
 • Rules run: 252
 • Targets scanned: 9
 • Parsed lines: ~100.0%
 • Scan was limited to files tracked by git
 • For a detailed list of skipped files and lines, run semgrep with the --verbose flag
Ran 252 rules on 9 files: 1 finding.Ensure evaluated contente is not definable by external sources
Details: https://sg.run/7ope
29 eval ‘console.log(“Tarefa adicionada: ‘ + input.value + ‘”);
#3 commit: 09bc3ebd2d850bf6ad9974a4fa1dc1cdd7ba43cd
GitHub Actions
Status  Duração Artefatos
FALHA   29s     1

Nenhum vazamento detectado
[x] Construção, Segurança e Assinatura

-Set up job                           [ok]
-Checkout do Código                   [ok]
-Inserir Secrets no Javascript        [ok]
-Build                                [ok]
-Secrets Scanning                     [ok]
-SAST-Semgrep                         [x] bloqueio => corrigir vulnerabilidade

vulnerabilidade na função addTask(), solução excluir o eval, deixando apenas o console.log e refatorar a função para não injetar html, nas linhas li, prevenindo ataques de injeção:
// Adiciona nova tarefa na tela
function addTask() {
    const input = document.getElementById('new-task');
    const output = document.getElementById('output');

    const li = document.createElement('li');
    li.textContent = input.value;
    output.appendChild(li);

    console.log("Tarefa adicionada: ' + input.value + '");

    input.value = '';
}

ao rodar o semgrep novamente aparaceram outras vulnerabilidades
 .github/workflows/pipeline.yml
    ❯❱ yaml.github-actions.security.github-actions-mutable-action-tag.github-actions-mutable-action-tag
          ❰❰ Blocking ❱❱
          GitHub Actions step uses a mutable tag or branch reference. Tags and branch names can be silently   
          repointed by the action owner, enabling supply-chain attacks — as seen in the trivy-action and kics-
          github-action compromises. Pin the reference to a full 40-character commit SHA instead, e.g. `uses: 
          actions/checkout@8ade135a41bc03ea155e62e844d188df1ea18608`.                                         
          Details: https://sg.run/2LgAL                                                                       
                                                                                                              
           23┆ uses: actions/checkout@v4
            ⋮┆----------------------------------------
           51┆ uses: gitleaks/gitleaks-action@v2
            ⋮┆----------------------------------------
           59┆ uses: actions/setup-python@v5
            ⋮┆----------------------------------------
           96┆ uses: sigstore/cosign-installer@v3
            ⋮┆----------------------------------------
          111┆ uses: actions/upload-artifact@v4
            ⋮┆----------------------------------------
          133┆ uses: actions/download-artifact@v4
            ⋮┆----------------------------------------
          138┆ uses: sigstore/cosign-installer@v3
            ⋮┆----------------------------------------
          156┆ uses: actions/configure-pages@v4
            ⋮┆----------------------------------------
          159┆ uses: actions/upload-pages-artifact@v3
            ⋮┆----------------------------------------
          166┆ uses: actions/deploy-pages@v4

Numa análise numa LLM apontou que @4 podem ser movidas pelo dono da action e se alguém comprometer seu pipeline pode executar código malicioso (com acesso aos secrets). O SHA é imutável, por susgestão de segurança está a criação de um script para substituir essas tags por chaves criptografadas => semgrep_pipe.sh

ao rodar o script temos esses resultados:
./semgrep_pipe.sh
✅ actions/checkout@v4 -> 11d5960a326750d5838078e36cf38b85af677262
✅ gitleaks/gitleaks-action@v2 -> ff98106e4c7b2bc287b24eaf42907196329070c7
✅ actions/setup-python@v5 -> a26af69be951a213d495a4c3e4e4022e16d87065
✅ sigstore/cosign-installer@v3 -> 398d4b0eeef1380460a10c8013a76f728fb906ac
✅ actions/upload-artifact@v4 -> ea165f8d65b6e75b540449e92b4886f43607fa02
✅ actions/download-artifact@v4 -> d3f86a106a0bac45b974a628896c90dbdf5c8093
✅ actions/configure-pages@v4 -> 1f0c5cde4bc74cd7e1254d0cb4de8d49e9068c7d
✅ actions/upload-pages-artifact@v3 -> 56afc609e74202658d3ffba0e8f6dda462b719fa
✅ actions/deploy-pages@v4 -> d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e

Após o script rodar o semgrep não apontou vulnerabilidades
┌──────────────┐
│ Scan Summary │
└──────────────┘
✅ Scan completed successfully.
 • Findings: 0 (0 blocking)
 • Rules run: 255
 • Targets scanned: 10
 • Parsed lines: ~100.0%
 • Scan was limited to files tracked by git
 • For a detailed list of skipped files and lines, run semgrep with the --verbose flag
Ran 255 rules on 10 files: 0 findings.
(need more rules? `semgrep login` for additional free Semgrep Registry rules)

#4 commit: d9be41e01aea65bbbec849501934c99538409dd3
GitHub Actions
Status  Duração Artefatos
FALHA   39s     2

Nenhum vazamento detectado
[x] Verificação e Implantação: HttpError: Não Encontrado
[x] Verificação e Implantação: A obtenção do site Pages falhou. Verifique se o repositório tem as páginas habilitadas e configuradas para compilar usando o GitHub Actions ou considere explorar o parâmetro `enablement` ...

-Set up job                   [ok]
-Baixar o artefato assinado   [ok]
-Instalar Cosign              [ok]
-Extrair site verificado      [ok]
-Configurar GitHub Pages      [x]

rodei a imagem grype na raíz do projeto => docker run --rm -v "${pwd}:/src" anchore/grype:latest dir:/src
obtivemos:

NAME                       INSTALLED  FIXED IN  TYPE           VULNERABILITY        SEVERITY  EPSS          RISK   
lodash                     4.17.4     4.17.21   npm            GHSA-35jh-r3h4-6jhm  High      21.3% (97th)  15.7   
qs                         6.7.0      6.7.3     npm            GHSA-hrpp-h998-j3pp  High      15.6% (96th)  11.7   
axios                      0.21.1     0.21.2    npm            GHSA-cph5-m8f7-6c5x  High      8.5% (94th)   6.4    
lodash                     4.17.4     4.17.12   npm            GHSA-jf85-cpcp-j695  Critical  5.0% (91st)   4.5    
lodash                     4.17.4     4.17.19   npm            GHSA-p6mc-m468-83gw  High      5.2% (92nd)   3.9    
lodash                     4.17.4     4.17.21   npm            GHSA-29mw-wpgm-hmr9  Medium    7.3% (94th)   3.8    
lodash                     4.17.4     4.18.0    npm            GHSA-r5fr-rjxr-66jc  High      2.6% (84th)   2.0    
lodash                     4.17.4     4.17.11   npm            GHSA-x5rq-j2xg-h7qm  Medium    3.2% (87th)   1.8    
lodash                     4.17.4     4.17.5    npm            GHSA-fvqr-27wr-82fm  Medium    2.4% (83rd)   1.4    
axios                      0.21.1     0.30.3    npm            GHSA-43fc-jf86-j433  High      1.8% (77th)   1.4    
lodash                     4.17.4     4.17.11   npm            GHSA-4xc9-xhrj-v574  High      1.6% (74th)   1.2    
lodash                     4.17.4     4.17.23   npm            GHSA-xxjr-mmjv-4gpg  Medium    1.8% (78th)   1.1    
axios                      0.21.1     0.31.1    npm            GHSA-3g43-6gmg-66jw  High      1.0% (62nd)   0.8    
axios                      0.21.1     0.32.0    npm            GHSA-hfxv-24rg-xrqf  High      1.0% (60th)   0.7    
path-to-regexp             0.1.7      0.1.10    npm            GHSA-9wv6-86v2-598j  High      0.9% (59th)   0.7    
axios                      0.21.1     0.31.1    npm            GHSA-pf86-5x62-jrwf  High      0.9% (59th)   0.7    
body-parser                1.19.0     1.20.3    npm            GHSA-qwcr-r2fm-qrc7  High      0.8% (55th)   0.6    
axios                      0.21.1     0.31.0    npm            GHSA-fvcv-3m26-pcqx  Medium    1.3% (69th)   0.6    
axios                      0.21.1     0.32.0    npm            GHSA-pjwm-pj3p-43mv  High      0.8% (54th)   0.6    
axios                      0.21.1     0.31.0    npm            GHSA-3p68-rc4w-qgx5  Medium    1.2% (66th)   0.6    
axios                      0.21.1     0.30.0    npm            GHSA-jr5f-v2jv-69x6  High      0.8% (54th)   0.6    
axios                      0.21.1     0.32.0    npm            GHSA-p92q-9vqr-4j8v  High      0.8% (53rd)   0.6    
path-to-regexp             0.1.7      0.1.12    npm            GHSA-rhx6-c78j-4q9w  High      0.8% (54th)   0.6    
axios                      0.21.1     0.31.1    npm            GHSA-62hf-57xw-28j9  Medium    1.0% (60th)   0.6    
axios                      0.21.1     0.32.0    npm            GHSA-j5f8-grm9-p9fc  High      0.8% (53rd)   0.6    
path-to-regexp             0.1.7      0.1.13    npm            GHSA-37ch-88jc-xwx2  High      0.6% (47th)   0.5    
express                    4.17.1     4.19.2    npm            GHSA-rv95-896h-c2vc  Medium    0.8% (54th)   0.4    
axios                      0.21.1     0.31.1    npm            GHSA-pmwg-cvhr-8vh7  High      0.6% (45th)   0.4    
axios                      0.21.1     0.31.1    npm            GHSA-w9j2-pvgh-6h63  Medium    0.8% (55th)   0.4    
axios                      0.21.1     0.28.0    npm            GHSA-wf5p-g6vw-rhxx  Medium    0.6% (44th)   0.3    
axios                      0.21.1     0.31.1    npm            GHSA-6chq-wfr3-2hj9  High      0.4% (29th)   0.3    
axios                      0.21.1     0.31.1    npm            GHSA-5c9x-8gcm-mpgx  Medium    0.5% (39th)   0.2    
axios                      0.21.1     0.31.1    npm            GHSA-vf2m-468p-8v99  Medium    0.5% (39th)   0.2    
axios                      0.21.1     0.33.0    npm            GHSA-mmx7-hfxf-jppx  Medium    0.4% (34th)   0.2    
qs                         6.7.0      6.16.0    npm            GHSA-4mjr-xmp4-gh2g  Medium    0.4% (33rd)   0.2    
qs                         6.7.0      6.14.1    npm            GHSA-6rw7-vpxm-498p  Medium    0.4% (36th)   0.2    
axios                      0.21.1     0.31.1    npm            GHSA-m7pr-hjqh-92cm  Medium    0.4% (29th)   0.2    
cookie                     0.4.0      0.7.0     npm            GHSA-pxg6-pf52-xh8x  Low       0.7% (53rd)   0.2    
lodash                     4.17.4     4.18.0    npm            GHSA-f23m-r3pf-42rh  Medium    0.4% (29th)   0.2    
serve-static               1.14.1     1.16.0    npm            GHSA-cm22-4g7w-348p  Low       0.6% (48th)   0.2    
axios                      0.21.1     0.32.0    npm            GHSA-898c-q2cr-xwhg  Medium    0.4% (32nd)   0.2    
send                       0.17.1     0.19.0    npm            GHSA-m6fv-jmcg-4jfg  Low       0.5% (43rd)   0.2    
axios                      0.21.1     0.33.0    npm            GHSA-7q8q-rj6j-mhjq  Medium    0.3% (22nd)   0.2    
qs                         6.7.0      6.14.2    npm            GHSA-w7fw-mjwx-w883  Low       0.5% (41st)   0.2    
axios                      0.21.1     0.31.1    npm            GHSA-xx6v-rp6x-q39c  Medium    0.3% (23rd)   0.2    
express                    4.17.1     4.20.0    npm            GHSA-qw6h-vgh9-j6wx  Low       0.5% (39th)   0.2    
body-parser                1.19.0     1.20.6    npm            GHSA-v422-hmwv-36x6  Low       0.4% (33rd)   0.1    
axios                      0.21.1     0.31.1    npm            GHSA-xhjh-pmcv-23jw  Low       0.3% (16th)   < 0.1  
actions/download-artifact  v4         4.1.3     github-action  GHSA-cxww-7g56-2vh6  High      N/A           N/A

Após a análise inicial do grype fizemos mapeamento das bibliotecas que precisavam ser atualizadas e pouco a pouco foram ajsutadas, além do grype a extensão Snyk ao rodar também apontava atualizações necessárias e assim rodando o grype  e vendo o Snyk fomos adequando o projeto.

Ainda tinha uma vulnerabilidade apontada pelo grype em actions/download-artifact 'v4'
Usando o comando  git ls-remote --tags --refs https://github.com/actions/download-artifact 'v4.*' | cut -f2 | sed 's
|refs/tags/||' | sort -V | tail -1
Obteve como saída v4.3.0 substituindo no pipeline.yml ficando => uses: actions/download-artifact@v4.3.0 # v4

Saída do docker run --rm -v "${pwd}:/src" anchore/grype:latest dir:/src
No vulnerabilities found

Saída do Snyk
Open Source> No open issues found
Code Security> (disabled in Settings)
Infrastructure As Code> No open issues found

#5 commit: e6120c1daa2d006db6a418e4223b5e46ae8e27b1
GitHub Actions
Status  Duração Artefatos
FALHA   1m 16s     2

Nenhum vazamento detectado
[x] Verificação e Implantação: HttpError: Não Encontrado
[x] Verificação e Implantação: A obtenção do site Pages falhou. Verifique se o repositório tem as páginas habilitadas e configuradas para compilar usando o GitHub Actions ou considere explorar o parâmetro `enablement` ...

-Set up job                   [ok]
-Baixar o artefato assinado   [ok]
-Instalar Cosign              [ok]
-Extrair site verificado      [ok]
-Configurar GitHub Pages      [x]


#6 commit: ea8f7d0deaee2fff074794537f23afeb061239ec
GitHub Actions
Status  Duração Artefatos
FALHA   2m 18s     2

implementação da assinatura
cosign sign-blob artifact.tar \
  --bundle artifact.sigstore.json \
  --yes
echo "Assinatura real gerada"
Não descomentei o passo abaixo por isso quebrou o deploy da página.

#7 commit: f0304eb4f4446e21c37e67ca8872aad72a0584e3
GitHub Actions
Status  Duração Artefatos
SUCESSO   2m 3s     3

Precisei fazer uma configuração no projeto
- Settings > Pages > Build and deployment - Source
  -> selecionar GitHub Actions (não deploy from a branch)

## URL de Produção
https://xtremeboombox1.github.io/projeto-devsecop-desafio/

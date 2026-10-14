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

## O que foi implementado
- [x] Secrets Scanning com **Gitleaks**
- [x] SAST com **Semgrep**
- [x] SCA com **Grype**
- [x] Assinatura do artefato com cosign
- [x] Deploy com **GitHub Pages**

## Como a pipeline funciona

A pipeline de DevSecOps implementada possui duas etapas principais: **Build + Segurança** e **Deploy**. Veja como cada step funciona:

### Job 1: Build, Segurança e Assinatura

#### 1. 📥 Checkout do Código
Faz o download completo do código do repositório, incluindo todo o histórico Git (`fetch-depth: 0`). Isso é essencial para que as ferramentas de segurança possam analisar não apenas o código atual, mas também o histórico de commits.

#### 2. ⚙️ Build
Valida que os arquivos da aplicação estão presentes e prontos para as próximas etapas.

#### 3. 🔑 Secrets Scanning com Gitleaks
**O que faz:** Escaneia todo o código-fonte e histórico do Git em busca de segredos vazados (senhas, tokens de API, chaves privadas, etc.).

**Por que é importante:** Evita que credenciais sensíveis sejam expostas publicamente no repositório, o que poderia levar a vazamentos de dados, acessos não autorizados e violações de segurança. O Gitleaks usa padrões e expressões regulares para detectar segredos conhecidos.

**Ação:** Se encontrar algum segredo, a pipeline **falha** e impede o deploy. Segredos históricos legítimos podem ser permitidos via `.gitleaksignore` com justificativa documentada.

#### 4. 🔍 SAST - Static Application Security Testing com Semgrep
**O que faz:** Analisa o código-fonte estático em busca de vulnerabilidades de segurança, como:
- Injeções de código (XSS, SQL Injection)
- Uso de funções perigosas (eval, innerHTML)
- Más práticas de segurança
- Vulnerabilidades comuns de OWASP

**Por que é importante:** Detecta problemas de segurança no próprio código da aplicação antes mesmo de executá-lo. É como ter um revisor de código especializado em segurança analisando cada linha.

**Ação:** Se encontrar vulnerabilidades, a pipeline **falha** e lista os problemas encontrados para correção.

#### 5. 📦 SCA - Software Composition Analysis com Grype
**O que faz:** Escaneia todas as dependências do projeto (bibliotecas npm) em busca de vulnerabilidades conhecidas (CVEs - Common Vulnerabilities and Exposures).

**Por que é importante:** A maioria dos projetos modernos usa dezenas ou centenas de bibliotecas de terceiros. Cada uma pode conter vulnerabilidades já descobertas e catalogadas. O Grype compara as versões instaladas contra bancos de dados de vulnerabilidades conhecidas.

**Ação:** Falha se encontrar vulnerabilidades de severidade **medium (média)** ou superior, forçando a atualização das dependências antes do deploy.

#### 6. 📦 Empacotamento e Assinatura
Depois que todos os testes de segurança passam:
- Empacota o site em um arquivo tar
- Calcula o hash SHA256 do artefato
- Gera uma assinatura criptográfica com Cosign (demonstração)
- Faz upload do artefato assinado para o próximo job

**Por que é importante:** Garante a integridade e autenticidade do artefato que será deployado.

### Job 2: Verificação e Deploy

#### 7. 🔎 Verificação de Assinatura
Baixa o artefato e verifica sua assinatura criptográfica antes de fazer o deploy.

**Por que é importante:** Garante que o artefato não foi adulterado entre o build e o deploy.

#### 8. 🚀 Deploy em Produção (GitHub Pages)
Após todas as verificações de segurança, faz o deploy automático da aplicação para o GitHub Pages.

**Deploy só acontece se:** Todos os steps de segurança passarem (Gitleaks, Semgrep e Grype).

---

## Vulnerabilidades Encontradas e Corrigidas

Durante a implementação da pipeline, as seguintes vulnerabilidades foram detectadas e corrigidas:

### 1. 🔑 Segredos Hardcoded no Código
**Problema:** Token de API do GitHub (`ghp_xK92mNpL34rTvQ87wZaB56cDeFgHiJkL`) e senha de banco de dados (`admin@prod#2024`) estavam expostos no arquivo `src/script.js`.

**Impacto:** Qualquer pessoa com acesso ao código poderia usar essas credenciais para acessar sistemas protegidos.

**Correção:** 
- Removidos os valores hardcoded do código
- Adicionado comentário indicando uso de variáveis de ambiente
- Criado `.gitleaksignore` para os segredos no histórico Git (já revogados)

**Commit:** `a765101`

### 2. 🛡️ Vulnerabilidade XSS (Cross-Site Scripting)
**Problema:** O código usava `innerHTML` com entrada do usuário não sanitizada:
```javascript
output.innerHTML = '<li>' + input.value + '</li>';
```

**Impacto:** Um atacante poderia injetar código HTML/JavaScript malicioso que seria executado no navegador de outros usuários.

**Correção:** Substituído por criação segura de elementos DOM com `textContent`:
```javascript
const li = document.createElement('li');
li.textContent = input.value;
output.appendChild(li);
```

**Commit:** `49ccfb7`

### 3. ⚠️ Uso Perigoso de eval()
**Problema:** Uso de `eval()` com entrada do usuário:
```javascript
eval('console.log("Tarefa adicionada: ' + input.value + '")');
```

**Impacto:** Permite execução arbitrária de código JavaScript, possibilitando ataques graves.

**Correção:** Removido o `eval()` e substituído por `console.log()` direto.

**Commit:** `49ccfb7`

### 4. 📦 Dependências Vulneráveis
**Problema:** Bibliotecas desatualizadas com vulnerabilidades conhecidas:
- `lodash 4.17.4` → Múltiplas CVEs
- `express 4.17.1` → Vulnerabilidades de segurança
- `axios 0.21.1` → Vulnerabilidades conhecidas

**Impacto:** Expõe a aplicação a explorações conhecidas e documentadas publicamente.

**Correção:** Atualizado para versões seguras:
- `lodash 4.17.21`
- `express 4.21.1`
- `axios 1.7.7`

**Commit:** `7d7b9c4`

---

## URL de Produção

🌐 **Aplicação em produção:** https://paulolima1212.github.io/projeto-devsecop-desafio/

A aplicação é automaticamente deployada no GitHub Pages após todas as verificações de segurança serem aprovadas.

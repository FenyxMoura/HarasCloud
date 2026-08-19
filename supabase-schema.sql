-- ==============================================================================
-- SCHEMA OFICIAL BANCO DE DADOS: HARAS CLOUD SAAS MULTI-TENANT (SUPABASE / POSTGRES)
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABELA DE HARAS (TENANTS SAAS)
CREATE TABLE IF NOT EXISTS haras_tenants (
    id TEXT PRIMARY KEY,
    nome_haras TEXT NOT NULL,
    subtitulo TEXT DEFAULT 'Gestão & Genética Equina',
    responsavel TEXT,
    email TEXT UNIQUE NOT NULL,
    telefone TEXT,
    cidade_uf TEXT,
    plano TEXT NOT NULL DEFAULT 'marchador', -- 'potro', 'marchador', 'imperial'
    status_assinatura TEXT NOT NULL DEFAULT 'trial', -- 'ativo', 'trial', 'bloqueado', 'cancelado'
    data_expiracao DATE NOT NULL,
    limite_equinos INTEGER NOT NULL DEFAULT 35,
    limite_usuarios INTEGER NOT NULL DEFAULT 6,
    logo_url TEXT,
    notificacao_tarefas_destino TEXT DEFAULT 'dono',
    som_notificacao_tarefas BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABELA DE USUÁRIOS & COLABORADORES
CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    haras_id TEXT REFERENCES haras_tenants(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    cargo TEXT NOT NULL, -- 'proprietario', 'administrador', 'veterinario', 'gerente', 'tratador', 'financeiro'
    telefone TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABELA DE EQUINOS (PLANTEL & GENEALOGIA)
CREATE TABLE IF NOT EXISTS equinos (
    id TEXT PRIMARY KEY,
    haras_id TEXT REFERENCES haras_tenants(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    raca TEXT NOT NULL,
    categoria TEXT NOT NULL, -- 'garanhão', 'matriz', 'potro', 'receptora', 'castrado'
    sexo TEXT NOT NULL,
    data_nascimento DATE,
    pelagem TEXT,
    microchip TEXT,
    registro_associacao TEXT,
    pai_nome TEXT,
    mae_nome TEXT,
    avo_paterno_pai TEXT,
    avo_paterno_mae TEXT,
    avo_materno_pai TEXT,
    avo_materno_mae TEXT,
    foto_capa TEXT,
    galeria_fotos JSONB DEFAULT '[]'::jsonb,
    escore_corporal NUMERIC(3,1),
    status TEXT DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABELA DE REPRODUÇÃO & BIOTECNOLOGIA (TE)
CREATE TABLE IF NOT EXISTS reproducao (
    id TEXT PRIMARY KEY,
    haras_id TEXT REFERENCES haras_tenants(id) ON DELETE CASCADE,
    matriz_id TEXT REFERENCES equinos(id) ON DELETE SET NULL,
    garanhao_id TEXT REFERENCES equinos(id) ON DELETE SET NULL,
    receptora_id TEXT REFERENCES equinos(id) ON DELETE SET NULL,
    tipo TEXT NOT NULL, -- 'cobertura_natural', 'inseminacao_ia', 'transferencia_embriao_te'
    data_procedimento DATE NOT NULL,
    status_prenhez TEXT DEFAULT 'em_espera', -- 'confirmada', 'vazia', 'reabsorvida', 'parida'
    previsao_parto DATE,
    escala_apgar INTEGER,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABELA DE SAÚDE & CALENDÁRIO SANITÁRIO
CREATE TABLE IF NOT EXISTS saude_registros (
    id TEXT PRIMARY KEY,
    haras_id TEXT REFERENCES haras_tenants(id) ON DELETE CASCADE,
    equino_id TEXT REFERENCES equinos(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- 'vacina', 'vermifugo', 'ferrageamento', 'odontologia', 'cirurgia', 'exame'
    titulo TEXT NOT NULL,
    data_aplicacao DATE NOT NULL,
    proxima_dose DATE,
    veterinario TEXT,
    medicamento TEXT,
    dose TEXT,
    lote TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABELA DE TAREFAS & MANEJO DIÁRIO
CREATE TABLE IF NOT EXISTS tarefas_manejo (
    id TEXT PRIMARY KEY,
    haras_id TEXT REFERENCES haras_tenants(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descricao TEXT,
    tipo TEXT NOT NULL, -- 'trato', 'baia', 'agua', 'soltura', 'curativo', 'treino'
    prioridade TEXT DEFAULT 'media',
    responsavel_id TEXT REFERENCES usuarios(id) ON DELETE SET NULL,
    data_agendada DATE NOT NULL,
    horario_agendado TIME,
    concluida BOOLEAN DEFAULT false,
    concluida_em TIMESTAMP WITH TIME ZONE,
    fotos_conclusao JSONB DEFAULT '[]'::jsonb,
    duracao_minutos INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABELA DE FINANCEIRO (DRE & FLUXO DE CAIXA)
CREATE TABLE IF NOT EXISTS financeiro_transacoes (
    id TEXT PRIMARY KEY,
    haras_id TEXT REFERENCES haras_tenants(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- 'receita', 'despesa'
    categoria TEXT NOT NULL,
    descricao TEXT NOT NULL,
    valor NUMERIC(12,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status TEXT DEFAULT 'pendente', -- 'pago', 'pendente', 'atrasado'
    equino_id TEXT REFERENCES equinos(id) ON DELETE SET NULL,
    comprovante_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. TABELA DE PAGAMENTOS SAAS (INFINITEPAY / ASSINATURAS)
CREATE TABLE IF NOT EXISTS pagamentos_saas (
    id TEXT PRIMARY KEY,
    haras_id TEXT REFERENCES haras_tenants(id) ON DELETE CASCADE,
    gateway TEXT DEFAULT 'infinitepay',
    transacao_id TEXT UNIQUE NOT NULL,
    plano TEXT NOT NULL,
    valor NUMERIC(10,2) NOT NULL,
    metodo TEXT NOT NULL, -- 'pix', 'cartao'
    status TEXT NOT NULL, -- 'approved', 'pending', 'failed'
    link_pagamento TEXT,
    qr_code_pix TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- HABILITAR ROW LEVEL SECURITY (RLS) PARA SEGURANÇA MULTI-TENANT ISOLADA
-- ==============================================================================
ALTER TABLE haras_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE equinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reproducao ENABLE ROW LEVEL SECURITY;
ALTER TABLE saude_registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas_manejo ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_transacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos_saas ENABLE ROW LEVEL SECURITY;

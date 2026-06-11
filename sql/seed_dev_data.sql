-- ============================================================================
-- Seed: dados fake mínimos para popular o app durante desenvolvimento
--
-- Volume:
--   • 5 brigadas (com endereços e lat/lng reais espalhados pelo Brasil)
--   • 3 campanhas (com 2 results cada e brigadas participantes)
--   • 4 notícias
--   • 3 artigos (mix de Artigo + Boas Práticas)
--   • 5 FAQs
--   • 6 itens (catálogo de doações)
--   • 8 atividades (catálogo)
--   • Itens e atividades vinculados às brigadas
--   • 3 participant_brigades (alguns linkando a brigades, outros não)
--
-- Idempotente: usa ON CONFLICT em colunas únicas (slug/name/email).
-- Pode rodar múltiplas vezes sem duplicar.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- BRIGADAS
-- ----------------------------------------------------------------------------
insert into brigades (slug, name, description, presentation, email, phone_number,
                      instagram, pix, acting_area, volunteers, foundation,
                      address, state, city, latitude, longitude, image_url)
values
  ('brigada-cerrado-vivo',
   'Brigada Cerrado Vivo',
   'Brigada voluntária dedicada à proteção do bioma Cerrado, com foco em prevenção e combate a incêndios florestais.',
   'Atuamos desde 2012 protegendo unidades de conservação do Distrito Federal. Treinamos novos brigadistas todo ano e mantemos uma equipe de pronto-emprego em períodos críticos.',
   'contato@cerradovivo.org.br',
   '(61) 99876-5432',
   '@cerradovivo',
   'cerradovivo@pix.com',
   'Combate a incêndios florestais, educação ambiental, monitoramento',
   42,
   '2012-08-15',
   'Quadra 305 Norte, Bloco B', 'DF', 'Brasília',
   -15.7801, -47.9292,
   'https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=800'),

  ('brigada-mata-atlantica-sp',
   'Brigada Voluntária Mata Atlântica SP',
   'Proteção da Mata Atlântica na Serra do Mar com foco em resgate de fauna durante incêndios.',
   'Operamos no entorno do Parque Estadual da Serra do Mar. Especializados em resgate e reabilitação de fauna silvestre afetada por queimadas.',
   'sos@brigadamataatlantica.org',
   '(11) 98765-4321',
   '@brigadamataatlantica',
   'brigada.ma@pix.com',
   'Resgate de fauna, primeiros socorros, combate a incêndios',
   28,
   '2015-03-20',
   'Estrada do Vergueiro, km 12', 'SP', 'São Paulo',
   -23.5505, -46.6333,
   'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800'),

  ('brigada-pantanal-livre',
   'Brigada Pantanal Livre',
   'Resposta rápida a incêndios no Pantanal Sul, com base em Corumbá.',
   'Após 2020, expandimos para 3 bases regionais. Atuamos em parceria com IBAMA e ICMBio em períodos de alta criticidade.',
   'pantanal@brigadalivre.org.br',
   '(67) 99123-4567',
   '@pantanallivre',
   '00067123456000',
   'Combate a incêndios em pantanal, evacuação de comunidades ribeirinhas',
   55,
   '2018-09-01',
   'Rua Dom Aquino, 1230', 'MS', 'Corumbá',
   -19.0094, -57.6531,
   'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800'),

  ('brigada-amazonia-norte',
   'Guardiões da Amazônia Norte',
   'Brigada indígena-comunitária no entorno de terras indígenas em Roraima.',
   'Formada por brigadistas indígenas e ribeirinhos. Trabalho contínuo de prevenção, queimas controladas tradicionais e combate.',
   'guardioes@amazonianorte.org',
   '(95) 99432-1098',
   '@guardioesamazonia',
   'guardioes@pix.com',
   'Manejo de fogo tradicional, combate a incêndios florestais',
   33,
   '2010-06-12',
   'Av. Capitão Júlio Bezerra, 450', 'RR', 'Boa Vista',
   2.8197, -60.6733,
   'https://images.unsplash.com/photo-1441260038675-7329ab4cc264?w=800'),

  ('brigada-caatinga-resiste',
   'Brigada Caatinga Resiste',
   'Brigada voluntária do sertão pernambucano, foco em prevenção em áreas de caatinga.',
   'Pequena equipe altamente treinada. Atendemos 12 municípios no Sertão do Pajeú. Captação de recursos via doações é nosso principal desafio.',
   'caatinga@resiste.org.br',
   '(81) 99876-1234',
   '@caatingaresiste',
   'caatinga@pix.com',
   'Educação ambiental, prevenção, combate inicial',
   18,
   '2019-11-05',
   'Rua Padre Cícero, 78', 'PE', 'Serra Talhada',
   -7.9897, -38.2989,
   'https://images.unsplash.com/photo-1552083375-1447ce886485?w=800')
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- ITEMS (catálogo de doações)
-- ----------------------------------------------------------------------------
insert into items (name, default_value, unit) values
  ('Capacete de Combate a Incêndio',  450.00, 'unidade'),
  ('Bota de Cano Longo',                280.00, 'par'),
  ('Abafador Manual',                    65.00, 'unidade'),
  ('Bombona Costal 20L',                320.00, 'unidade'),
  ('Kit de Primeiros Socorros',         180.00, 'kit'),
  ('Lanterna Profissional',             120.00, 'unidade')
on conflict (name) do nothing;

-- ----------------------------------------------------------------------------
-- ACTIVITIES (catálogo)
-- ----------------------------------------------------------------------------
insert into activities (name, description, icon) values
  ('Combate a Incêndios',
   'Atuação direta em ocorrências de fogo em vegetação',
   'fire'),
  ('Resgate de Fauna',
   'Captura, primeiros cuidados e encaminhamento de animais silvestres',
   'paw'),
  ('Primeiros Socorros',
   'Atendimento pré-hospitalar a vítimas em locais de emergência',
   'medical'),
  ('Educação Ambiental',
   'Palestras e oficinas em escolas e comunidades sobre prevenção',
   'school'),
  ('Treinamento de Brigadistas',
   'Cursos para novos voluntários e reciclagem de equipes',
   'training'),
  ('Monitoramento de Focos',
   'Vigilância e detecção precoce em áreas de risco',
   'binoculars'),
  ('Queima Controlada',
   'Manejo de fogo preventivo em parceria com órgãos ambientais',
   'fire-controlled'),
  ('Apoio a Comunidades',
   'Suporte a populações afetadas por incêndios e evacuações',
   'people')
on conflict (name) do nothing;

-- ----------------------------------------------------------------------------
-- ITEMS_BRIGADE (cada brigada precisa de alguns itens, com valor regional)
-- ----------------------------------------------------------------------------
-- Dependemos dos slugs/names já inseridos acima.
insert into items_brigade (brigade_id, item_id, value, quantity_needed)
select b.id, i.id, v.value, v.qty
from (values
  ('brigada-cerrado-vivo',         'Capacete de Combate a Incêndio', 470.00, 15),
  ('brigada-cerrado-vivo',         'Bombona Costal 20L',             320.00, 8),
  ('brigada-cerrado-vivo',         'Kit de Primeiros Socorros',      180.00, 5),
  ('brigada-mata-atlantica-sp',    'Bota de Cano Longo',             310.00, 20),
  ('brigada-mata-atlantica-sp',    'Lanterna Profissional',          135.00, 12),
  ('brigada-pantanal-livre',       'Abafador Manual',                 70.00, 30),
  ('brigada-pantanal-livre',       'Bombona Costal 20L',             340.00, 15),
  ('brigada-amazonia-norte',       'Capacete de Combate a Incêndio', 520.00, 20),
  ('brigada-amazonia-norte',       'Bota de Cano Longo',             295.00, 25),
  ('brigada-caatinga-resiste',     'Kit de Primeiros Socorros',      170.00, 4),
  ('brigada-caatinga-resiste',     'Lanterna Profissional',          110.00, 8)
) as v(brigade_slug, item_name, value, qty)
join brigades b on b.slug = v.brigade_slug
join items    i on i.name = v.item_name
on conflict (brigade_id, item_id) do nothing;

-- ----------------------------------------------------------------------------
-- ACTIVITIES_BRIGADE
-- ----------------------------------------------------------------------------
insert into activities_brigade (brigade_id, activity_id)
select b.id, a.id
from (values
  ('brigada-cerrado-vivo',     'Combate a Incêndios'),
  ('brigada-cerrado-vivo',     'Educação Ambiental'),
  ('brigada-cerrado-vivo',     'Treinamento de Brigadistas'),
  ('brigada-mata-atlantica-sp','Combate a Incêndios'),
  ('brigada-mata-atlantica-sp','Resgate de Fauna'),
  ('brigada-mata-atlantica-sp','Primeiros Socorros'),
  ('brigada-pantanal-livre',   'Combate a Incêndios'),
  ('brigada-pantanal-livre',   'Apoio a Comunidades'),
  ('brigada-pantanal-livre',   'Monitoramento de Focos'),
  ('brigada-amazonia-norte',   'Combate a Incêndios'),
  ('brigada-amazonia-norte',   'Queima Controlada'),
  ('brigada-amazonia-norte',   'Apoio a Comunidades'),
  ('brigada-caatinga-resiste', 'Educação Ambiental'),
  ('brigada-caatinga-resiste', 'Combate a Incêndios')
) as v(brigade_slug, activity_name)
join brigades   b on b.slug = v.brigade_slug
join activities a on a.name = v.activity_name
on conflict (brigade_id, activity_id) do nothing;

-- ----------------------------------------------------------------------------
-- CAMPAIGNS
-- ----------------------------------------------------------------------------
insert into campaigns (slug, title, description, body, pix, image_url,
                       start_date, end_date, published_at)
values
  ('equipamento-pantanal-2026',
   'Equipamento Novo para o Pantanal',
   'Ajude a Brigada Pantanal Livre a comprar 30 abafadores manuais antes da temporada seca.',
   'A temporada 2026 promete ser severa segundo o INMET. Nossa meta é equipar 30 brigadistas com abafadores novos antes de agosto. Cada doação de R$ 70 representa 1 abafador.',
   'pantanal2026@pix.com',
   'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200',
   '2026-04-01T00:00:00-03:00',
   '2026-08-31T23:59:59-03:00',
   '2026-04-01T10:00:00-03:00'),

  ('treinamento-cerrado-2026',
   'Treinamento de 50 Novos Brigadistas',
   'Forme a próxima geração de brigadistas do Cerrado.',
   'Cada novo brigadista treinado custa R$ 800 (curso de 40h + EPI básico). Nossa meta é formar 50 voluntários em 2026 para reforçar 4 brigadas parceiras no DF e entorno.',
   'cerradoformacao@pix.com',
   'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200',
   '2026-02-15T00:00:00-03:00',
   '2026-12-31T23:59:59-03:00',
   '2026-02-15T09:00:00-03:00'),

  ('socorro-fauna-mata-atlantica',
   'Centro de Reabilitação de Fauna',
   'Construir um pequeno centro de reabilitação para fauna resgatada de incêndios.',
   'Hoje a fauna resgatada é levada a centros distantes. Queremos construir um espaço próprio com 10 cercados, sala veterinária e suprimentos. Orçamento: R$ 180.000.',
   'centrofaunama@pix.com',
   'https://images.unsplash.com/photo-1444212477490-ca407925329e?w=1200',
   '2026-05-01T00:00:00-03:00',
   '2027-04-30T23:59:59-03:00',
   '2026-05-01T08:00:00-03:00')
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- CAMPAIGN_RESULTS
-- ----------------------------------------------------------------------------
insert into campaign_results (campaign_id, label, value, position)
select c.id, v.label, v.val, v.pos
from (values
  ('equipamento-pantanal-2026',     'Abafadores arrecadados', '12 de 30',          0),
  ('equipamento-pantanal-2026',     'Doações',                'R$ 4.200',          1),
  ('treinamento-cerrado-2026',      'Brigadistas formados',   '18 de 50',          0),
  ('treinamento-cerrado-2026',      'Próxima turma',          'Julho/2026',        1),
  ('socorro-fauna-mata-atlantica',  'Animais resgatados',     '47 em 2025',        0),
  ('socorro-fauna-mata-atlantica',  'Arrecadação',            'R$ 23.500 / 180k',  1)
) as v(slug, label, val, pos)
join campaigns c on c.slug = v.slug;

-- ----------------------------------------------------------------------------
-- PARTICIPANT_BRIGADES
-- 2 deles linkam a brigades já cadastradas; 1 é só "participante"
-- ----------------------------------------------------------------------------
insert into participant_brigades (name, image_url, brigade_id)
select v.name, v.image_url, b.id
from (values
  ('Brigada Cerrado Vivo',           'https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=400', 'brigada-cerrado-vivo'),
  ('Brigada Pantanal Livre',         'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=400', 'brigada-pantanal-livre')
) as v(name, image_url, brigade_slug)
left join brigades b on b.slug = v.brigade_slug;

-- Participante sem brigade_id (ex: brigada parceira sem cadastro completo)
insert into participant_brigades (name, image_url) values
  ('Brigada Florestal de Goiás', 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=400');

-- ----------------------------------------------------------------------------
-- CAMPAIGN_BRIGADE (brigadas participantes de cada campanha)
-- ----------------------------------------------------------------------------
insert into campaign_brigade (campaign_id, participant_id)
select c.id, p.id
from (values
  ('equipamento-pantanal-2026',     'Brigada Pantanal Livre'),
  ('treinamento-cerrado-2026',      'Brigada Cerrado Vivo'),
  ('socorro-fauna-mata-atlantica',  'Brigada Florestal de Goiás')
) as v(campaign_slug, participant_name)
join campaigns            c on c.slug = v.campaign_slug
join participant_brigades p on p.name = v.participant_name
on conflict (campaign_id, participant_id) do nothing;

-- ----------------------------------------------------------------------------
-- NEWS
-- ----------------------------------------------------------------------------
insert into news (slug, title, subtitle, summary, body, author, source_url,
                  image_url, published_at)
values
  ('pantanal-temporada-2026-inicia',
   'Pantanal entra em alerta com início da temporada seca',
   'Brigadas se mobilizam após primeiros focos detectados',
   'INPE registra 240% mais focos que a média histórica em maio. Brigadas voluntárias estão em prontidão.',
   'O Instituto Nacional de Pesquisas Espaciais (INPE) divulgou na última semana dados preocupantes sobre o início da temporada seca no Pantanal. Os 312 focos registrados em maio representam um aumento de 240% em relação à média dos últimos 10 anos para o mesmo período. Brigadas voluntárias da região, em conjunto com IBAMA e ICMBio, estão em prontidão e ativaram bases regionais para resposta rápida.',
   'Maria Oliveira',
   'https://example.org/noticias/pantanal-2026',
   'https://images.unsplash.com/photo-1523246224990-496e9a19113a?w=1200',
   '2026-06-02T14:30:00-03:00'),

  ('brasilia-novo-treinamento',
   'Brasília sediará curso nacional de combate a incêndios',
   '120 brigadistas de 12 estados participarão',
   'O curso de 80h reúne brigadas voluntárias e oficiais em parceria com a UnB.',
   'A capital federal recebe entre 15 e 22 de julho o Curso Nacional de Combate a Incêndios Florestais. Serão 80 horas de capacitação envolvendo 120 brigadistas de 12 estados, com aulas teóricas na UnB e práticas no Parque Nacional de Brasília. Inscrições gratuitas até 30 de junho.',
   'João Santos',
   'https://example.org/noticias/curso-brasilia',
   'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=1200',
   '2026-05-28T10:00:00-03:00'),

  ('amazonia-recorde-prevencao',
   'Amazônia Norte registra ano com menos focos em uma década',
   'Trabalho de brigadas indígenas é apontado como diferencial',
   'Roraima fechou 2025 com 38% menos focos que 2024, segundo MMA.',
   'O ministério do Meio Ambiente divulgou hoje balanço da temporada 2025 na Amazônia Norte: 38% menos focos de calor em comparação a 2024. O trabalho contínuo de brigadas indígenas-comunitárias, associado ao manejo de fogo tradicional e queimas controladas, é apontado como principal fator de sucesso.',
   'Ana Pereira',
   'https://example.org/noticias/amazonia-2025',
   'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200',
   '2026-01-20T09:15:00-03:00'),

  ('caatinga-mobilizacao',
   'Sertão pernambucano forma brigada comunitária pioneira',
   '18 voluntários iniciam atividades em Serra Talhada',
   'Iniciativa atende demanda de 12 municípios sem cobertura oficial.',
   'A Brigada Caatinga Resiste oficializou suas atividades este mês com 18 voluntários treinados. É a primeira brigada comunitária estruturada no Sertão do Pajeú, região com histórico de incêndios em períodos críticos e baixa cobertura por corpos de bombeiros oficiais.',
   'Carlos Lima',
   null,
   'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200',
   '2026-03-10T16:45:00-03:00')
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- ARTICLES (Artigo + Boas Práticas)
-- ----------------------------------------------------------------------------
insert into articles (slug, title, subtitle, summary, body, author, category,
                      image_url, published_at)
values
  ('aceiros-corretos-cerrado',
   'Como construir aceiros eficientes no Cerrado',
   'Boas práticas para prevenção em propriedades rurais',
   'Aceiros bem construídos previnem 70% dos incêndios em propriedades pequenas.',
   'Os aceiros são faixas de terreno limpas que isolam áreas vegetadas, impedindo a propagação do fogo. Para serem eficazes no Cerrado, devem ter no mínimo 3 metros de largura e ser limpos antes de cada temporada seca. Este artigo cobre técnicas de construção, manutenção e parcerias com brigadas locais.',
   'Eng. Florestal Patrícia Mendes',
   'Boas Práticas',
   'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200',
   '2026-05-10T11:00:00-03:00'),

  ('manejo-fogo-tradicional',
   'Manejo de fogo tradicional: ciência e ancestralidade',
   'Comunidades indígenas como referência em prevenção',
   'Estudo de 5 anos mostra eficácia de técnicas tradicionais combinadas a tecnologia.',
   'Um estudo conduzido em parceria com 4 etnias e a Embrapa avaliou o impacto do manejo de fogo tradicional comparado a métodos exclusivamente modernos. Resultados surpreendentes: áreas com manejo tradicional apresentaram 45% menos eventos de fogo descontrolado.',
   'Dr. Roberto Tukano e equipe',
   'Artigo',
   'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1200',
   '2026-04-22T08:30:00-03:00'),

  ('como-doar-com-impacto',
   'Como doar com impacto para brigadas voluntárias',
   'Guia prático para apoiadores',
   'Pequenas doações recorrentes têm mais impacto que grandes doações pontuais.',
   'Brigadas voluntárias dependem de previsibilidade financeira para planejar treinamentos e manutenção de equipamentos. Doações de R$ 30/mês recorrentes valem mais que R$ 1.000 pontuais. Este guia mostra como escolher uma brigada, formas de doação e como acompanhar o uso dos recursos.',
   'Equipe Conexão Brigada',
   'Boas Práticas',
   'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1200',
   '2026-03-05T14:00:00-03:00')
on conflict (slug) do nothing;

-- ----------------------------------------------------------------------------
-- FAQS
-- ----------------------------------------------------------------------------
-- Apaga FAQs com question genéricas pra evitar duplicar (não tem unique)
delete from faqs where question in (
  'Como me voluntariar em uma brigada?',
  'Preciso de experiência prévia?',
  'Qual o custo do treinamento?',
  'Como minha empresa pode apoiar?',
  'Como minha brigada pode ser cadastrada na plataforma?'
);

insert into faqs (question, answer, position) values
  ('Como me voluntariar em uma brigada?',
   'Você pode buscar brigadas próximas pela página "Visualizar Brigadas", entrar em contato direto com a brigada de seu interesse e participar do processo seletivo dela. Cada brigada tem critérios próprios.',
   1),
  ('Preciso de experiência prévia?',
   'Não. A maioria das brigadas oferece treinamento gratuito para iniciantes (geralmente 40 horas). Você precisa ter idade mínima de 18 anos, boa condição física e disponibilidade para os treinos.',
   2),
  ('Qual o custo do treinamento?',
   'Os treinamentos oferecidos pelas brigadas voluntárias geralmente são gratuitos. Em alguns casos, o brigadista precisa adquirir parte do próprio EPI, mas várias brigadas têm programas de empréstimo de equipamento.',
   3),
  ('Como minha empresa pode apoiar?',
   'Empresas podem doar equipamentos, recursos financeiros via PIX/transferência, oferecer espaços para treinamentos ou liberar funcionários voluntários durante a temporada seca. Entre em contato pela página de Contato.',
   4),
  ('Como minha brigada pode ser cadastrada na plataforma?',
   'Brigadas voluntárias formalizadas podem solicitar cadastro pela página "Cadastre sua Brigada". Validamos cada cadastro antes de publicar para garantir que as informações sejam confiáveis.',
   5);

-- ============================================================================
-- Resumo final (não obrigatório, só pra você conferir após rodar)
-- ============================================================================
-- select 'brigades' as tabela, count(*) from brigades
-- union all select 'campaigns', count(*) from campaigns
-- union all select 'campaign_results', count(*) from campaign_results
-- union all select 'campaign_brigade', count(*) from campaign_brigade
-- union all select 'news', count(*) from news
-- union all select 'articles', count(*) from articles
-- union all select 'faqs', count(*) from faqs
-- union all select 'items', count(*) from items
-- union all select 'items_brigade', count(*) from items_brigade
-- union all select 'activities', count(*) from activities
-- union all select 'activities_brigade', count(*) from activities_brigade
-- union all select 'participant_brigades', count(*) from participant_brigades;

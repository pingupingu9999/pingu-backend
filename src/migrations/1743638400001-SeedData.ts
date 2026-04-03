import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedData1743638400001 implements MigrationInterface {
  name = 'SeedData1743638400001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // --- Authorities ---
    await queryRunner.query(`
      INSERT INTO "pb_authority" ("name") VALUES
        ('ROLE_USER'),
        ('ROLE_ADMIN')
      ON CONFLICT DO NOTHING
    `);

    // --- Interaction types ---
    await queryRunner.query(`
      INSERT INTO "pb_interaction" ("name","description","emoji","active","created_by") VALUES
        ('Like',       'Apprezzamento generico',        '👍', TRUE, 'system'),
        ('Interessato','Voglio saperne di più',         '🔥', TRUE, 'system'),
        ('Salva',      'Salva per dopo',                '🔖', TRUE, 'system'),
        ('Condividi',  'Condividi con altri',           '📤', TRUE, 'system')
      ON CONFLICT DO NOTHING
    `);

    // --- Categories ---
    await queryRunner.query(`
      INSERT INTO "pb_category" ("name","description","emoji","active","created_by") VALUES
        ('Istruzione',        'Lezioni, ripetizioni, tutoraggio',          '📚', TRUE, 'system'),
        ('Sport & Fitness',   'Allenamento, sport di squadra, wellness',   '⚽', TRUE, 'system'),
        ('Casa & Giardino',   'Riparazioni, giardinaggio, traslochi',      '🏠', TRUE, 'system'),
        ('Tecnologia',        'Assistenza PC, sviluppo, grafica',          '💻', TRUE, 'system'),
        ('Food & Cucina',     'Cuoco a domicilio, catering, dolci',        '🍕', TRUE, 'system'),
        ('Arte & Musica',     'Lezioni di strumenti, pittura, fotografia', '🎵', TRUE, 'system'),
        ('Salute & Benessere','Massaggi, yoga, meditazione',               '💆', TRUE, 'system'),
        ('Trasporti',         'Passaggi, consegne, noleggio',              '🚗', TRUE, 'system'),
        ('Animali',           'Dog sitting, toelettatura, veterinaria',    '🐾', TRUE, 'system'),
        ('Eventi',            'Organizzazione eventi, animazione, DJ',     '🎉', TRUE, 'system'),
        ('Moda & Bellezza',   'Sartoria, parrucchiere, make-up',           '✂️', TRUE, 'system'),
        ('Altro',             'Tutto ciò che non rientra nelle altre',     '✨', TRUE, 'system')
      ON CONFLICT DO NOTHING
    `);

    // --- Category Tags (sample per ogni categoria) ---
    await queryRunner.query(`
      INSERT INTO "pb_category_tag" ("category_id","name","description","emoji","active","created_by")
      SELECT c.id, t.name, t.description, t.emoji, TRUE, 'system'
      FROM "pb_category" c
      JOIN (VALUES
        ('Istruzione',      'Ripetizioni Matematica',   'Lezioni di matematica per tutti i livelli',   '➗'),
        ('Istruzione',      'Ripetizioni Lingue',       'Inglese, francese, spagnolo e altro',         '🌍'),
        ('Istruzione',      'Ripetizioni Scienze',      'Fisica, chimica, biologia',                   '🔬'),
        ('Istruzione',      'Tutoraggio universitario', 'Supporto per corsi universitari',             '🎓'),
        ('Sport & Fitness', 'Personal Trainer',         'Allenamento personalizzato',                  '💪'),
        ('Sport & Fitness', 'Ottavo a calcetto',        'Cerco giocatori per partita di calcetto',     '⚽'),
        ('Sport & Fitness', 'Tennis',                   'Giocatori di tennis per doppio o singolo',    '🎾'),
        ('Sport & Fitness', 'Running partner',          'Compagno di corsa',                           '🏃'),
        ('Casa & Giardino', 'Idraulico',                'Riparazioni idrauliche',                      '🔧'),
        ('Casa & Giardino', 'Elettricista',             'Impianti elettrici',                          '⚡'),
        ('Casa & Giardino', 'Giardinaggio',             'Cura del giardino e piante',                  '🌱'),
        ('Casa & Giardino', 'Traslochi',                'Aiuto per traslochi',                         '📦'),
        ('Tecnologia',      'Sviluppo Web',             'Siti web e applicazioni',                     '🌐'),
        ('Tecnologia',      'Assistenza PC',            'Riparazione e configurazione PC',             '🖥️'),
        ('Tecnologia',      'Grafica & Design',         'Loghi, volantini, branding',                  '🎨'),
        ('Tecnologia',      'Stampa 3D',                'Oggetti e prototipi con stampante 3D',        '🖨️'),
        ('Food & Cucina',   'Cuoco a domicilio',        'Preparo pasti a casa tua',                    '👨‍🍳'),
        ('Food & Cucina',   'Catering eventi',          'Servizi catering per eventi',                 '🍽️'),
        ('Food & Cucina',   'Dolci & Pasticceria',      'Torte e dolci personalizzati',                '🎂'),
        ('Arte & Musica',   'Lezioni Chitarra',         'Chitarra classica o elettrica',               '🎸'),
        ('Arte & Musica',   'Lezioni Pianoforte',       'Pianoforte per tutti i livelli',              '🎹'),
        ('Arte & Musica',   'Fotografia',               'Servizi fotografici e editing',               '📸'),
        ('Salute & Benessere','Massaggio',              'Massaggi rilassanti e terapeutici',            '💆'),
        ('Salute & Benessere','Yoga',                   'Lezioni di yoga individuali o di gruppo',     '🧘'),
        ('Trasporti',       'Passaggi in auto',         'Passaggi per pendolari o eventi',             '🚗'),
        ('Trasporti',       'Consegne',                 'Consegna pacchi e oggetti',                   '📦'),
        ('Animali',         'Dog Sitting',              'Accudisco il tuo cane',                       '🐕'),
        ('Animali',         'Cat Sitting',              'Accudisco il tuo gatto',                      '🐈'),
        ('Animali',         'Toelettatura',             'Bagno e toelettatura animali',                '✂️'),
        ('Eventi',          'Organizzazione Feste',     'Organizzazione compleanni e feste',           '🎂'),
        ('Moda & Bellezza', 'Sartoria',                 'Cucito, riparazioni e creazioni su misura',   '🧵'),
        ('Moda & Bellezza', 'Parrucchiere',             'Tagli e trattamenti a domicilio',             '💇')
      ) AS t(cat_name, name, description, emoji) ON c.name = t.cat_name
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "pb_category_tag"`);
    await queryRunner.query(`DELETE FROM "pb_category"`);
    await queryRunner.query(`DELETE FROM "pb_interaction"`);
    await queryRunner.query(`DELETE FROM "pb_authority"`);
  }
}

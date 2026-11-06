# Hryvnia Hub

Веб-MVP платформы объявлений Украины: автомобили, недвижимость, готовый бизнес и инвестиции.

## Сейчас
- Категории: автомобили, недвижимость, готовый бизнес, инвестиции
- Поиск
- Фильтр по городу
- Форма добавления объявления
- Подготовлено подключение к Supabase

## Структура
- `index.html` — интерфейс
- `styles.css` — дизайн
- `app.js` — логика и Supabase

## Supabase
В `app.js` нужно указать:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Не публикуйте `service_role` ключ в браузерном коде.

Площадь участка в формах, карточках и фильтрах недвижимости указана в м².
Основное значение — `property_details.land_area_m2`; старые записи с `land_area_sotkas` читаются с преобразованием (1 сотка = 100 м²).
При сохранении оба значения синхронизируются; неизвестная площадь остаётся `null`. Изменение схемы Supabase не требуется.
Experimental branch test

## Проверки

`node --test tests/app.test.cjs` — изолированные регрессионные тесты поиска районов, публикации всех категорий и редактирования/поиска автомобилей с моками, без запросов к Supabase и Storage и без дополнительных зависимостей.

`node --check app.js` — проверка синтаксиса JavaScript.

Инициализация аккаунта, публикация и сохранение изменений проверяют личность через `auth.getUser()`. Отсутствие сессии открывает вход при публикации; ошибки проверки не разрешают запись. При редактировании владелец повторно проверяется до загрузки фотографий и изменения объявления.

Шаблон редактора недвижимости не содержит ID формы создания; элементы редактора ищутся внутри его контейнера. Повторная синхронизация автомобильных полей не скрывает уже открытую оценку и дополнительные поля; смена категории скрывает их.

Имена загружаемых фотографий используют `crypto.randomUUID()` или UUID v4 на основе `crypto.getRandomValues()`. Если безопасный генератор недоступен, загрузка завершается явной ошибкой. Локальные preview URL освобождаются при удалении, закрытии редактора и ошибке декодирования, включая завершение обработки после закрытия; существующие URL из Storage не отзываются. Эти сценарии включены в регрессионные тесты.

Редактор автомобилей сохраняет валюту (UAH, USD, PLN), старые значения характеристик и неизвестные ключи оснащения. Марку и модель, уже записанные в объявлении, можно сохранить при недоступном или изменившемся каталоге; новая пара проверяется по каталогу. При смене валюты старая цена сбрасывается, чтобы карточка не сравнивала суммы в разных валютах.

Поиск автомобилей учитывает старые записи без валюты как UAH и оба варианта кузова «Универсал»/«Універсал». Неизвестные числовые характеристики не считаются нулём при заданном диапазоне. Повторное открытие автомобильной категории сохраняет текущие фильтры; явный сброс и смена категории очищают их.

Проверки доступа на клиенте не заменяют Supabase RLS и политики Storage. Их конфигурации нет в репозитории; проверка реальных прав и публикации требует отдельной проверки в Supabase с тестовыми аккаунтами.

## Security Scanner

Security Scanner использует существующий модуль `security/`: репозиторный анализатор, SQL/RLS анализатор, отдельный read-only инспектор каталога Supabase, CLI и общий Markdown/JSON отчёт. Статические сигналы помечаются `POTENTIAL`; подтверждённые результаты npm advisory и непосредственно наблюдаемые настройки отделяются от предположений.

```sh
npm test
npm run check:app
npm run security:repository
npm run security:supabase
npm run security:audit
npm run security:report
```

`security:repository` проверяет JavaScript/HTML на опасные DOM/XSS sinks и динамическое исполнение, ищет private credentials без вывода значения, анализирует GitHub Actions и выполняет полноценный `npm audit` по `package-lock.json`. `security:supabase` проверяет SQL migrations, RLS/policies, ownership, GRANT, SECURITY DEFINER/RPC и Storage. `security:audit` объединяет обе области; команды пишут `security-report.md` и `security-report.json` в корень. `security:report` формирует тот же отчёт без ненулевого кода завершения по CRITICAL/HIGH.

Отчёт группирует Repository Security, Supabase Database Security, Storage Security, Dependencies, Authentication и SQL/RLS; показывает Critical/High/Medium/Low/Info и статусы `PASS`/`FAIL`/`NOT_RUN`. Отсутствие источников или невозможность проверки не трактуется как успех. Для npm advisory нужен lockfile и доступ к npm registry; `npm audit` не отключается.

Для live-проверки требуется установленный `psql` и отдельный PostgreSQL login. URL не передаётся в аргументах процесса и не сохраняется в отчёте:

```sh
export SUPABASE_READONLY_DATABASE_URL='postgresql://<read-only-user>:<password>@<host>:5432/postgres'
node security/cli.cjs supabase --live-supabase
node security/cli.cjs audit --live-supabase
unset SUPABASE_READONLY_DATABASE_URL
```

Live scanner читает каталоги PostgreSQL в `BEGIN READ ONLY` и только конфигурационные колонки `storage.buckets` (`id`, `name`, `public`, лимит размера и MIME-типы). Он не читает пользовательские таблицы/строки, `storage.objects` или тела функций и не исполняет RPC. Перед сканированием проверяется отдельный login: без memberships, владения объектами, повышенных атрибутов, эффективных DML/DDL или доступа к пользовательским таблицам. TLS вне loopback требует `sslmode=verify-full`; URL `service_role` отклоняется, а ошибки и credentials не попадают в отчёт. При недостаточных правах, неполном snapshot или неполном inventory Storage coverage остаётся `NOT_RUN`, а не `PASS`.

Для Production дополнительно обязательны `SUPABASE_AUDIT_ENVIRONMENT=production`, `SUPABASE_EXPECTED_PRODUCTION_HOST`, `SUPABASE_EXPECTED_PRODUCTION_DATABASE`, `SUPABASE_EXPECTED_PRODUCTION_BUCKETS` (список имён через запятую) и точное подтверждение `SUPABASE_PRODUCTION_TARGET_CONFIRMATION="PRODUCTION <host>/<database>"`. URL должен использовать login `sherlock_audit`, совпадающие host/database и `sslmode=verify-full`. Не запускайте Production audit без отдельного разрешения и защищённого окружения. Если для чтения bucket metadata не хватает прав, минимальная SQL-заявка на согласование (не выполнять автоматически) такова:

```sql
GRANT USAGE ON SCHEMA storage TO sherlock_audit;
GRANT SELECT (id, name, public, file_size_limit, allowed_mime_types)
  ON TABLE storage.buckets TO sherlock_audit;
```

Этот grant не обходит RLS: если policies скрывают часть bucket inventory, Storage coverage останется `NOT_RUN`; scanner не добавляет policies и не выдаёт права. Отсутствие локальных SQL migrations отдельно отражается в coverage и не мешает запустить live scan, но общий отчёт не выдаёт полный `PASS` при неполном покрытии.

GitHub Actions workflow `.github/workflows/security-audit.yml` сохраняет существующие проверки на push/PR/schedule; они не подключаются к Production. Для единого ручного аудита выберите **Full Security Audit** через **Actions → Security Scanner → Run workflow** на ветке `security-scanner-full-audit` и введите точное подтверждение `PRODUCTION <host>/<database>`. Production job требует Environment approval и выполняет Repository, migration и live проверки в одном отчёте; при отсутствии migrations отчёт остаётся `NOT_RUN`, хотя успешная live-проверка выполняется и проверяется отдельно.

Перед первым запуском настройте GitHub Environment `supabase-production-audit` с required reviewers, secret `SUPABASE_READONLY_DATABASE_URL` и variables `SUPABASE_EXPECTED_PRODUCTION_HOST`, `SUPABASE_EXPECTED_PRODUCTION_DATABASE`, `SUPABASE_EXPECTED_PRODUCTION_BUCKETS` (имена bucket через запятую). Secret доступен только защищённой Production job и передаётся только scanner step после approval. Не храните credentials в коде; workflow не применяет migrations и не изменяет Production.

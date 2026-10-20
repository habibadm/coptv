# Instalar COPTV en el servidor (Asustor u otro Linux con Docker)

Queda funcionando:

| Dirección | Qué es |
|---|---|
| `https://coptv.cop.org.py` | App de TV en el navegador y API para las apps |
| `https://panel.coptv.cop.org.py/admin` | Panel de contenido |

Los certificados HTTPS se sacan y renuevan solos. Los videos siguen saliendo de Bunny; el servidor solo guarda el catálogo y las imágenes.
GitHub arma las imágenes Docker en cada cambio (`.github/workflows/imagenes.yml`); el servidor solo las descarga.

## Antes de instalar

1. **DNS:** dos registros A hacia la IP pública: `coptv.cop.org.py` y `panel.coptv.cop.org.py`.
2. **Router:** reenviar el puerto público 80 (TCP) al 8090 del Asustor y el 443 al 8453. Esos puertos internos se cambian en `.env` (`HTTP_PORT`, `HTTPS_PORT`); así no chocan con ADM ni con Web Center.
   Los públicos tienen que seguir siendo 80 y 443: los usa Let's Encrypt para dar el certificado.
3. **Docker:** en ADM, App Central > instalar **Docker Engine**.
4. **SSH:** en ADM, Servicios > Terminal > activar SSH.

## Instalar

Desde una computadora en la misma red:

```sh
ssh admin@IP-DEL-ASUSTOR
sudo -i
mkdir -p /volume1/Docker/coptv && cd /volume1/Docker/coptv
curl -fsSL https://raw.githubusercontent.com/habibadm/coptv/main/deploy/instalar.sh | sh
```

La primera vez crea `.env` con los dominios de arriba y genera las claves internas. Si hay que cargar las claves de Bunny o la señal en vivo, editar `.env` (`vi .env`) y volver a ejecutar la última línea.

**Enseguida después de instalar**, abrir `https://panel.coptv.cop.org.py/admin` y crear la cuenta de administrador: la primera persona que entra queda como dueña del panel.

## Actualizar

Repetir la línea de `curl ... | sh` en la misma carpeta. Descarga la última versión y reinicia sin perder datos.

## Datos y respaldo

Todo queda en volúmenes de Docker (`coptv_db`, `coptv_uploads`, `coptv_caddy`). Copia de la base de datos:

```sh
docker compose exec db pg_dump -U strapi strapi > respaldo-$(date +%F).sql
```

## Si algo no anda

- `docker compose ps`: los cuatro servicios tienen que estar `Up`.
- `docker compose logs caddy`: si no consigue el certificado, revisar el DNS y los puertos 80/443.
- `docker compose logs panel` o `docker compose logs api`.

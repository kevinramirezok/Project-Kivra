# 🍫 Kivra Nutrir - Barritas & Granolas Saludables

Sistema completo de gestión de productos con tienda online y panel administrativo.

## 🚀 Características

- **Tienda Online**: Catálogo dinámico de productos con carrito de compras
- **Panel Administrativo**: Gestión completa de productos y stock
- **Historial de Movimientos**: Registro detallado de todas las operaciones
- **Responsive Design**: Compatible con dispositivos móviles
- **API REST**: Backend robusto con MySQL

## 📁 Estructura del Proyecto

```
PROYECTO KIVRA/
├── BACKEND/              # Servidor Express + API
│   ├── index.js         # Servidor principal
│   ├── package.json     # Dependencias
│   └── .env            # Variables de entorno
├── FRONTEND/           # Aplicación web
│   ├── index.html      # Tienda online
│   ├── stock.html      # Panel administrativo
│   ├── JavaScript/     # Lógica del frontend
│   ├── css/           # Estilos
│   └── imagenes/      # Imágenes de productos
└── README.md          # Esta documentación
```

## 🛠️ Instalación y Uso

### Backend
```bash
cd BACKEND
npm install
npm start
```

### Base de Datos
Configurar variables de entorno en `.env`:
```
MYSQLHOST=localhost
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=tu_password
MYSQLDATABASE=kivra
```

### Frontend
Abrir `FRONTEND/index.html` en el navegador o usar un servidor local.

## 🌐 Despliegue

Compatible con:
- Railway (recomendado)
- Heroku
- Vercel
- Netlify

## 📊 API Endpoints

- `GET /api/productos` - Obtener todos los productos
- `POST /api/productos` - Crear producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto
- `GET /api/movimientos` - Historial de movimientos

## 🎯 Funcionalidades

- ✅ Gestión de productos (CRUD completo)
- ✅ Control de stock en tiempo real
- ✅ Historial de movimientos
- ✅ Carrito de compras
- ✅ Promociones dinámicas
- ✅ Diseño responsive
- ✅ Subida de imágenes

## 👨‍💻 Autor

Kevin Ramirez - Sistema desarrollado para Kivra Nutrir

---

*Barritas & Granolas Saludables* 🌱
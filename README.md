# How to use

## Setup
- Install dependencies
```
npm install
```
- For running
```
npm run nodemon
```
- result
```
We are live on 4000
```

# Port
For testing use port 8086.
For production use port 3000.

# Install npm-check-updates (ncu)
Url: https://www.npmjs.com/package/npm-check-updates

- Instalar de forma global
```
npm install -g npm-check-updates
```

- Ejecutar el comando  ncu para ver todas la librerias desatualizadas
```
ncu
```

```
Checking package.json
[====================] 5/5 100%
 
 express           4.12.x  →   4.13.x
 multer            ^0.1.8  →   ^1.0.1
 react-bootstrap  ^0.22.6  →  ^0.24.0
 react-a11y        ^0.1.1  →   ^0.2.6
 webpack          ~1.9.10  →  ~1.10.5
 
Run ncu -u to upgrade package.json
```

- Aplicar la actualizacion a las nuevas versiones en el package.json
```
ncu -u
```
```
Upgrading package.json
[====================] 1/1 100%
 
 express           4.12.x  →   4.13.x
 
Run npm install to install new versions.
```

- Aplicar instalacion de dependencias actualizadas
```
npm install
```
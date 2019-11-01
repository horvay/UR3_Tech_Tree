# UR3 Tech Tree 

## Usage : 

##### Run the react project from the renderer directory :

```js
cd renderer
npm install // First time only
npm run start
```

##### Run electron app's main process from main directory :

```js
cd main
npm install // First time only
npm run start
```

## To Build and Bundle :

+ Just make sure that you have added all the dependencies in the `main/package.json` to the `renderer/package.json` and the run the below command from the `renderer` folder.

```js
cd renderer
npm run release // or npm run build
```

**Sit back and have a cub of Coffee while the app gets built**  . 

You will now have a full fledged application waiting for you in the `dist` folder.

---


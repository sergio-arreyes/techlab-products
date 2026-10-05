const BASE_URL = 'https://fakestoreapi.com';

const args = process.argv.slice(2);
const [rawMethod, rawEndpoint, ...params] = args;

if (!rawMethod || !rawEndpoint) {
  console.log(`
Uso de la herramienta CLI:
  - Consultar todos:       npm run start GET products
  - Consultar por ID:      npm run start GET products/<productId>
  - Crear producto:        npm run start POST products <title> <price> <category>
  - Eliminar producto:     npm run start DELETE products/<productId>
  `);
  process.exit(1);
}

const method = rawMethod.trim().toUpperCase();
const endpoint = rawEndpoint.trim();

async function main() {
  const [resource, productId] = endpoint.split('/');

  if (resource !== 'products') {
    console.error(`Error: Recurso no reconocido "${resource}". Debe ser "products".`);
    return;
  }

  try {
    switch (method) {
      case 'GET':
        if (productId) {
          await getProductById(productId);
        } else {
          await getAllProducts();
        }
        break;

      case 'POST':
        if (params.length < 3) {
          console.error('Error: Faltan parámetros. Formato: POST products <title> <price> <category>');
          return;
        }
        await createProduct(params);
        break;

      case 'DELETE':
        if (!productId) {
          console.error('Error: Debe especificar el ID. Formato: DELETE products/<productId>');
          return;
        }
        await deleteProduct(productId);
        break;

      default:
        console.error(`Error: Método HTTP "${method}" no soportado. Usa GET, POST o DELETE.`);
    }
  } catch (error) {
    console.error('Error en la comunicación con la API:', error.message);
  }
}

async function getAllProducts() {
  console.log('Consultando todos los productos...');
  const response = await fetch(`${BASE_URL}/products`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  console.log(data);
}

async function getProductById(id) {
  console.log(`Consultando el producto con ID ${id}...`);
  const response = await fetch(`${BASE_URL}/products/${id}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  console.log(data);
}

async function createProduct(productParams) {
  const [title, rawPrice, category] = productParams;
  const price = Number(rawPrice);

  const newProduct = {
    title,
    price: isNaN(price) ? rawPrice : price,
    category
  };

  console.log('Creando nuevo producto...');
  const response = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProduct)
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  console.log('Respuesta de la API:', data);
  console.log(`ID del producto creado: ${data.id}`);
}

async function deleteProduct(id) {
  console.log(`Eliminando producto con ID ${id}...`);
  const response = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  console.log('Respuesta de eliminación:', data);
}

main();
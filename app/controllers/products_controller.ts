// // app/controllers/products_controller.ts
// import type { HttpContext } from '@adonisjs/core/http'
// import Product from '#models/product'

// export default class ProductsController {
//   async show({ view, params }: HttpContext) {
//     const id = params.id
//     const product = await Product.findOrFail(id)
//     return view.render('product/detail', { product, id })
//   }
// }

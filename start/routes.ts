/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.on('/').render('pages/index')

router.get('/about',  ({ view }) => {
    return view.render('pages/about')
})

router.get('/search',  ({ view }) => {
    return view.render('pages/product')
})

router.get('/contact', ({view}) => {
    return view.render("pages/contact")
})

router.get('/login', ({view}) => {
    return view.render("pages/login")
})

router.get('/register', ({view}) => {
    return view.render("pages/register")
})

router.get('/cart', ({view}) => {
    return view.render("pages/cart")
})

router.get('/index', ({view}) => {
    return view.render("pages/index")
})

router.get('detail/p1', ({view}) => {
    return view.render("pages/detail/p1")
})

router.get('detail/p2', ({view}) => {
    return view.render("pages/detail/p2")
})

router.get('detail/p3', ({view}) => {
    return view.render("pages/detail/p3")
})

router.get('detail/p4', ({view}) => {
    return view.render("pages/detail/p4")
})

router.get('detail/p5', ({view}) => {
    return view.render("pages/detail/p5")
})

router.get('detail/p6', ({view}) => {
    return view.render("pages/detail/p6")
})


router.get('detail/:id', async ({view, params }) => {
    const id = params.id;
    return view.render("pages/detailProduct",{id})
})

router.get('/add', ({view}) => {
    return view.render("pages/addProduct")
})

router.get('/seller', ({view}) => {
    return view.render("pages/dashboard-seller")
})

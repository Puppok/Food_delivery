const cartButton = document.querySelector('.cart-button')
const cart = document.querySelector('.cart')
const cartClose = document.querySelector('.cart-close')
const catalog = document.querySelector('.main-shop')
const cartList = document.querySelector('.cart-content')
const cartTotal = document.querySelector('.cart-total')

let products = []
let order = new Map()
let formatPrice = value => `${value.toLocaleString('ru-RU')} Р`

const renderCatalog = () => {
    catalog.innerHTML = products.map((product) =>
        `
            <section class="shop-item">
                <img src="../assets/${product.image}">
                <h3>${product.name}</h3>
                <p class="item-info">${product.description}</p>
                <div>
                    <p>${product.weight}</p>
                    <p>${formatPrice(product.price)}</p>
                </div>
                
                <button class="shop-item-add" data-id="${product.id}">Заказать</button>
            </section>
        `
    ).join('')
}

const renderCart = () => {
    const lines = [...order.entries()]

    cartList.innerHTML = lines.length === 0
        ? '<li class="cart-empty">Корзина пуста</li>'
        : lines.map(([id, line]) =>
            `
                <li class="cart-item">
                    <div class="cart-item-head">
                        <span class="cart-item-name">${line.name}</span>
                        <button class="cart-item-remove" data-id="${id}" data-remove aria-label="Убрать ${line.name} из корзины">X</button>
                    </div>
                    <div class="cart-item-row">
                        <div class="cart-item-counter">
                            <button class="cart-item-arrow" data-id="${id}" data-step="-1" aria-label="Уменьшить">-</button>
                            <span class="cart-item-count">${line.count}</span>
                            <button class="cart-item-arrow" data-id="${id}" data-step="1" aria-label="Увеличить">+</button>
                        </div>
                        <span class="cart-item-sum">${formatPrice(line.price * line.count)}</span>
                    </div>
                </li>
            `
        ).join('')

    const total = lines.reduce((sum, [, line]) => sum + line.price * line.count, 0)
    cartTotal.textContent = `Итого: ${formatPrice(total)}`
}

catalog.addEventListener('click', (event) => {
    const button = event.target.closest('.shop-item-add')

    if (!button) {
        return
    }

    const id = Number(button.dataset.id)
    const line = order.get(id)

    if (line) {
        line.count += 1
    }
    else {
        const product = products.find(item => item.id === id)
        order.set(id, {name: product.name, price: product.price, count: 1})
    }

    renderCart()
    openCart()
})

cartList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-id]')

    if (!button) {
        return
    }

    const id = Number(button.dataset.id)
    const line = order.get(id)

    if ('remove' in button.dataset) {
        order.delete(id)
    }
    else {
        line.count += Number(button.dataset.step)

        if (line.count < 1) {
            order.delete(id)
        }
    }

    renderCart()
})

const isCartOpen = () => cart.classList.contains('cart-open')

function openCart() {
    if (isCartOpen()) {
        return
    }

    cart.classList.add('cart-open')
    cart.removeAttribute('inert')
    cartButton.setAttribute('area-expanded', 'true')
    cartButton.focus({preventScroll: true})
}

function closeCart() {
    if (!isCartOpen()) {
        return
    }

    cart.classList.remove('cart-open')
    cart.setAttribute('inert', '')
    cartButton.setAttribute('area-expanded', 'false')
    cartButton.focus({preventScroll: true})
}

cartButton.addEventListener('click', () => {isCartOpen() ? closeCart() : openCart()})
cartClose.addEventListener('click', closeCart)
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        closeCart()
    }
})

document.addEventListener('pointerdown', event => {
    if (isCartOpen() && !event.target.closest('.cart, .cart-button, .shop-item-add')) {
        closeCart()
    }
})

fetch('/api/products')
    .then((response) => response.json())
    .then((data) => {
        products = data
        renderCatalog()
    })
    .catch(() => {
        catalog.innerHTML = '<p class="catalog-error">Не удалось загрузить каталог</p>'
    })



renderCart()
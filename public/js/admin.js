const deleteProduct = (btn) => {
    const prodId = btn.parentNode.querySelector('[name=productID]').value;
    const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

    const productElm = btn.closest('article');

    fetch(`/admin/product/${prodId}`,{
      method: 'DELETE',
      headers: {
        'csrf-token': csrf
      }
    }).then((response) => {
      console.log(response)
      return response.json(); //built in js func that return promise
    })
    .then(data => {
      productElm.remove();//not works in EI
    })
    .catch((err) => {
      console.error(err)
    })
}
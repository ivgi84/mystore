exports.eror404 = (req, res, next) => {
    res.status(404).render('404', { pageTitle:'Page not found', content: 'Page not Found!!!' });
    //res.status(404).sendFile(path.join(__dirname, 'views', '404page.html')); this way is used if we don't use template engine
}

exports.error500 = (req, res, next) => {
    res.status(500).render('500', { pageTitle:'Error occured' });
}
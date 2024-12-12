const signupBtn = document.getElementById('signup-btn');
const pass = document.getElementById('pass');
const confPass = document.getElementById('conf-pass');
const pageBody = document.getElementById('page-body');
const email = document.getElementById('email');
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');

signupBtn.addEventListener('click', (e)=> {

    e.preventDefault();

    const error = document.getElementById('error');
    const passNoMatch = document.getElementById('pass-no-match');

    error ? pageBody.removeChild(error) : '';
    passNoMatch ? pageBody.removeChild(passNoMatch): '';

    if (email.value == '' || firstName.value == '' || lastName.value == '' || pass.value == '' || confPass.value == '') {
        const h1 = document.createElement('h1');
        h1.id = 'error';
        h1.textContent = 'Please fill out all fields!';
        h1.classList.add('p-4', 'w-full', 'text-center', 'text-red-600', 'text-xl');
        pageBody.appendChild(h1);
    } else {
        if (pass.value != confPass.value) {
            const h1 = document.createElement('h1');
            h1.id = 'pass-no-match'
            h1.textContent = 'Passwords do not match!';
            h1.classList.add('p-4', 'w-full', 'text-center', 'text-red-600', 'text-xl');
            pageBody.appendChild(h1);
        } else {
            console.log(e.target);
            e.target.form.submit();
        }
    }
});

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description"
        content="Multipurpose, super flexible, powerful, clean modern responsive bootstrap 5 admin template">
    <meta name="keywords"
        content="admin template, ra-admin admin template, dashboard template, flat admin template, responsive admin template, web app">
    <meta name="author" content="la-themes">
    <link rel="icon" href="../assets/images/logo/favicon.png" type="image/x-icon">
    <link rel="shortcut icon" href="../assets/images/logo/favicon.png" type="image/x-icon">
    <title>Rahat Boat | Login</title>

    <link rel="stylesheet" href="../assets/vendor/fontawesome/css/all.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="../assets/vendor/tabler-icons/tabler-icons.css">
    <link rel="stylesheet" href="../assets/vendor/bootstrap/bootstrap.min.css">
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/responsive.css">
</head>

<body>
    <div class="app-wrapper d-block">
        <main class="w-100 p-0">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12 p-0">
                        <div class="login-form-container">
                            <div class="mb-4">
                                <a class="logo d-inline-block" href="/">
                                    <img src="../assets/images/logo/1.png" width="250" alt="Logo">
                                </a>
                            </div>

                            <div class="form_container">
                               

                                <form class="app-form" action="{{ route('login.store') }}" method="POST">
                                    @csrf
                                    <div class="mb-3 text-center">
                                        <h3>Login to your Account</h3>
                                        <p class="f-s-12 text-secondary">Get started with our app, just login and enjoy.</p>
                                    </div>
                                     @if ($errors->any())
                                    <div class="alert alert-danger text-center">
                                        {{ $errors->first() }}
                                    </div>
                                     @endif

                                    <div class="mb-3">
                                        <label class="form-label">Email address</label>
                                        <input type="email" name="email" class="form-control" required>
                                        <div class="form-text">We'll never share your email with anyone else.</div>
                                    </div>

                                    <div class="mb-3">
                                        <label class="form-label">Password</label>
                                        <input type="password" name="password" class="form-control" required>
                                    </div>

                                    <div class="mb-3 form-check">
                                        <input type="checkbox" name="remember" class="form-check-input" id="formCheck1">
                                        <label class="form-check-label" for="formCheck1">Remember me</label>
                                    </div>

                                    <div>
                                        <button type="submit" class="btn btn-primary w-100">Submit</button>
                                    </div>

                                    <div class="app-divider-v justify-content-center">
                                        <p>OR</p>
                                    </div>

                                    <div class="mb-3 text-center">
                                        <button type="button" class="btn btn-primary icon-btn b-r-5 m-1"><i
                                                class="ti ti-brand-facebook text-white"></i></button>
                                        <button type="button" class="btn btn-danger icon-btn b-r-5 m-1"><i
                                                class="ti ti-brand-google text-white"></i></button>
                                        <button type="button" class="btn btn-dark icon-btn b-r-5 m-1"><i
                                                class="ti ti-brand-github text-white"></i></button>
                                    </div>

                                    <div class="text-center">
                                        <a href="./terms_condition.html" class="text-secondary text-decoration-underline">Terms of use &amp; Conditions</a>
                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- Scripts -->
    <script src="../assets/js/jquery-3.6.3.min.js"></script>
    <script src="../assets/vendor/bootstrap/bootstrap.bundle.min.js"></script>
</body>

</html>

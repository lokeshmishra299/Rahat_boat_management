<?php

return [

    'paths' => ['api/*','sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
    'http://localhost:5173',  
    'http://localhost:3000',
    'http://34.65.111.173', 
    'https://9w8vdvl0s0yg.share.zrok.io'
],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
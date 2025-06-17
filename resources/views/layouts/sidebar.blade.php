<body>
  <div class="app-wrapper">

    <div class="loader-wrapper">
      <div class="loader_16"></div>
    </div>

    <!-- Menu Navigation starts -->
    <nav>
      <div class="app-logo">
        <a class="logo d-inline-block" href="index.html">
          <img src="{{asset('assets/images/logo/1.png') }}" alt="#">
        </a>

        <span class="bg-light-primary toggle-semi-nav">
          <i class="ti ti-chevrons-right f-s-20"></i>
        </span>
      </div>
      <div class="app-nav" id="app-simple-bar">

        <ul class="main-nav p-0 mt-2">

          <li class="no-sub">
            <a class="" href="{{ route('home') }}">
              <i class="ph-duotone  ph-house-line"></i> Dashboard
            </a>
          </li>
          <li class="no-sub">
            <a class="" href="{{ route('district.dashboard') }}">
              <i class="ph-duotone  ph-map-pin-line"></i> Districts
            </a>
          </li>

          <li>
            <a class="" data-bs-toggle="collapse" href="#dashboard" aria-expanded="false">
              <!-- <i class="ph-duotone  ph-house-line"></i> -->
                <i class="ph-duotone ph-boat"></i>
              Boat Management
              <span class="badge text-bg-success badge-notification ms-2">2</span>
            </a>
            <ul class="collapse" id="dashboard">
              <li><a href="{{ route('add.boat') }}">Ragister New Boat </a></li>
              <li><a href="{{ route('boat.directory') }}">Boat Directory</a></li>
            </ul>
          </li>

          <li>
            <a class="" data-bs-toggle="collapse" href="#ghaats" aria-expanded="false">
              <i class="ph-duotone  ph ph-waves"></i>
              Ghaat Management
              <span class="badge text-bg-success badge-notification ms-2">2</span>
            </a>
            <ul class="collapse" id="ghaats">
              <li><a href="{{ route('add.ghaat') }}">Ragister New Ghaat </a></li>
              <li><a href="{{ route('ghaat.directory') }}">Ghaat Directory</a></li>
            </ul>
          </li>
          

          <li>
            <a class="" data-bs-toggle="collapse" href="#Jacket" aria-expanded="false">
              <i class="ph-duotone ph-shield"></i>
              Life Jackets
              <span class="badge text-bg-success badge-notification ms-2">2</span>
            </a>
            <ul class="collapse" id="Jacket">
              <li><a href="{{ route('record.distribution') }}">Record Distribution </a></li>
              <li><a href="{{ route('distribution.tracking') }}">Distribution Tracking</a></li>
            </ul>
          </li>

          <li>
            <a class="" data-bs-toggle="collapse" href="#Inspection" aria-expanded="false">
              <i class="ph-duotone ph-magnifying-glass"></i>
              Boat Inspection
              <span class="badge text-bg-success badge-notification ms-2">4</span>
            </a>
            <ul class="collapse" id="Inspection">
              <li><a href="{{ route('Inspection') }}">Add Inspection</a></li>
              <li><a href="{{ route('Records') }}">Inspection Records</a></li>
              <li><a href="{{ route('Schedule') }}">Inspection schedule</a></li>
              <li><a href="{{ route('Analytics') }}">Analytics</a></li>
            </ul>
          </li>

          <li>
            <a class="" data-bs-toggle="collapse" href="#User" aria-expanded="false">
              <i class="ph-duotone ph-user"></i>
              User Management
              <span class="badge text-bg-success badge-notification ms-2">3</span>
            </a>
            <ul class="collapse" id="User">
              <li><a href="{{ route('roles.index') }}">Role</a></li>
              <li><a href="{{ route('create.user') }}">Create User</a></li>
              <li><a href="{{ route('user.list') }}">User List</a></li>
             
            </ul>
          </li>

          <li class="no-sub">
            <a class="" href="mailto:teqlathemes@gmail.com">
              <i class="ph-duotone  ph-chats"></i> Support
            </a>
          </li>


        </ul>
      </div>

      <div class="menu-navs">
        <span class="menu-previous"><i class="ti ti-chevron-left"></i></span>
        <span class="menu-next"><i class="ti ti-chevron-right"></i></span>
      </div>

    </nav>
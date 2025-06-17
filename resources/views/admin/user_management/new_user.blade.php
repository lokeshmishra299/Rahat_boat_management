@extends('layouts.app')
@section('title')
    | {{ $page_title }}
@endsection

@section('content')

    <!-- Body main section starts -->
    <main>
        <div class="container-fluid">
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h4 class="mb-0">{{ !empty($user) ? 'Update User' : 'Create User' }}</h4>
                            <a href="{{ route('user.list') }}" class="btn btn-sm btn-primary">User List</a>
                        </div>

                        <div class="card-body">
                            <form action="{{ !empty($user) ? route('update.user') : route('store.user') }}" method="POST"
                                class="row g-3 needs-validation" novalidate>
                                @csrf
                                @if(!empty($user))
                                    <input type="hidden" name="id" value="{{ old('id', $user->id) }}">
                                @endif

                                <!-- Full Name -->
                                <div class="col-md-4">
                                    <label for="name" class="form-label">Full Name</label>
                                    <input type="text" class="form-control" id="name" name="name"
                                        value="{{ old('name', $user->name ?? '') }}" required>
                                    <div class="valid-feedback">Please Enter Fullname.</div>
                                </div>

                                <!-- Email -->
                                <div class="col-md-4">
                                    <label for="email" class="form-label">Email Address</label>
                                    <input type="email" class="form-control" id="email" name="email"
                                        value="{{ old('email', $user->email ?? '') }}" required>
                                    <div class="valid-feedback">Please Enter Valid Email Address.</div>
                                </div>

                                <!-- Role -->
                                <div class="col-md-4">
                                    <label for="role_id" class="form-label">Assign Role</label>
                                    <select class="form-select" id="role_id" name="role_id" required>
                                        <option disabled value="">--Select Role--</option>
                                        @foreach($roles as $role)
                                            <option value="{{ $role->id }}" {{ old('role_id', $user->role_id ?? '') == $role->id ? 'selected' : '' }}>
                                                {{ $role->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    <div class="invalid-feedback">Please select a valid user role.</div>
                                </div>

                                <!-- District -->
                                <div class="col-md-6">
                                    <label for="district" class="form-label">District</label>
                                    <select class="form-select" id="district" name="district_id" required>
                                        <option disabled value="">--Select District--</option>
                                        @foreach($districts as $district)
                                            <option value="{{ $district->id }}" {{ old('district_id', $user->district_id ?? '') == $district->id ? 'selected' : '' }}>
                                                {{ $district->district_name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    <div class="invalid-feedback">Please select a valid district.</div>
                                </div>

                                <!-- Designation -->
                                <div class="col-md-6">
                                    <label for="Designation" class="form-label">Designation</label>
                                    <select class="form-select" id="Designation" name="designation" required>
                                        <option disabled value="">--Select Designation--</option>
                                        @foreach($roles as $role)
                                            <option value="{{ $role->name }}" {{ old('designation', $user->designation ?? '') == $role->name ? 'selected' : '' }}>
                                                {{ $role->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    <div class="invalid-feedback">Please select a valid user designation.</div>
                                </div>


                                <div class="col-sm-6">
                                    <label for="password1" class="form-label">New
                                        Password</label>
                                    <div class="input-group input-group-password mb-3">
                                        <span class="input-group-text b-r-left"><i
                                                class="ph-bold  ph-lock f-s-20"></i></span>
                                        <input type="password" id="password1" class="form-control" name="password"
                                            placeholder="*******" {{ empty($user) ? 'required' : '' }}
                                            aria-label="Amount (to the nearest dollar)">
                                            
                                        <span class="input-group-text b-r-right"><i
                                                class="ph ph-eye-slash f-s-20 eyes-icon1 " id="showPassword1"></i></span>

                                    </div>
                                     <div class="invalid-feedback">Please create a strong password.</div>
                                </div>
                                <div class="col-sm-6">
                                    <label for="password2" class="form-label">Confirm
                                        Password</label>
                                    <div class="input-group input-group-password mb-3">
                                        <span class="input-group-text b-r-left"><i
                                                class="ph-bold  ph-lock f-s-20"></i></span>
                                        <input type="password" id="password2" class="form-control"
                                            name="password_confirmation" placeholder="*******" {{ empty($user) ? 'required' : '' }} aria-label="Amount (to the nearest dollar)">
                                        <span class="input-group-text b-r-right"><i
                                                class="ph ph-eye-slash f-s-20 eyes-icon2" id="showPassword2"></i></span>

                                    </div>
                                    <div class="invalid-feedback">Please re-enter same password.</div>
                                </div>

                                <div class="col-12">
                                    <button class="btn btn-primary" type="submit">{{ !empty($user) ? 'Update' : 'Create' }}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
            <!-- Form Validation end -->

        </div>
    </main>
    <!-- Body main section ends -->


<script>
document.addEventListener("DOMContentLoaded", () => {
    ['1', '2'].forEach(i => {
        document.getElementById("showPassword" + i).onclick = function () {
            let input = document.getElementById("password" + i);
            input.type = input.type === "password" ? "text" : "password";
            this.classList.toggle("ph-eye");
            this.classList.toggle("ph-eye-slash");
        };
    });
});
</script>


@endsection
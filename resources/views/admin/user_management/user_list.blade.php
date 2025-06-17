@extends('layouts.app')
@section('title')
    | {{ $page_title }}
@endsection

@section('content')

    <!-- Body main section starts -->
    <main>
        <div class="container-fluid">
            <!-- Breadcrumb start -->
            <!-- <div class="row m-1">
                    <div class="col-12 ">
                        <h4 class="main-title mb-3">User Roles</h4>
                    </div>
                </div> -->

            <!-- Breadcrumb end -->

            <!-- Data Table start -->
            <div class="row">
                <!-- Default Datatable start -->
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h4 class="mb-0">User List</h4>
                            <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#createUserModal">
                                Create User
                            </button>
                        </div>

                        <div class="card-body p-0">
                            <div class="app-datatable-default overflow-auto">
                                <table id="example" class="display app-data-table default-data-table">
                                    <thead>
                                        <tr>
                                            <th>SR NO</th>
                                            <th>District</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Role</th>
                                            <th>Designation</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach($users as $index => $user)
                                            <tr>
                                                <td>{{ $index + 1 }}</td>
                                                <td>{{ $user->district->district_name ?? 'N/A' }}</td>
                                                <td>{{ $user->name ?? 'N/A' }}</td>
                                                <td>{{ $user->email ?? 'N/A' }}</td>
                                                <td>{{ $user->roles->pluck('name')->implode(', ') ?? 'N/A'}}</td>
                                                <td>{{ $user->designation ?? 'N/A' }}</td>
                                                <td>
                                                 <div class="form-check form-switch text-center  ">
                                                    <input type="checkbox"
                                                        class="form-check-input form-check-primary fs-4"
                                                        id="user-switch-{{ $user->id }}"
                                                        {{ $user->status ? 'checked' : '' }}
                                                        onchange="toggleUserStatus({{ $user->id }}, this)">
                                                    <label class="form-check-label pt-2" for="user-switch-{{ $user->id }}"></label>
                                                </div>

                                                </td>
                                                <td>
                                                    <a href="{{ route('user.edit', $user->id) }}"
                                                        class="btn btn-light-success icon-btn b-r-4">
                                                        <i class="ti ti-edit text-success"></i>
                                                    </a>
                                                    <a href="{{ route('user.delete', $user->id) }}"
                                                        onclick="return confirm('Delete user {{ $user->name }}?')"
                                                        class="btn btn-light-danger icon-btn b-r-4">
                                                        <i class="ti ti-trash text-danger"></i>
                                                    </a>
                                                </td>
                                            </tr>
                                        @endforeach
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </main>

<script>
    function toggleUserStatus(userId, checkbox) {
        const status = checkbox.checked ? 1 : 0;

        $.ajax({
            url: `/users/update-status/${userId}`,
            method: 'POST',
            data: {
                status: status,
                _token: '{{ csrf_token() }}'
            },
            success: function (data) {
                toastr[data.success ? 'success' : 'error'](data.message || 'Status update failed.');
            },
            error: function () {
                toastr.error('Something went wrong.');
            }
        });
    }
</script>


@endsection
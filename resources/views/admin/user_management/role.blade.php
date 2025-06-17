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
                    <div class="card ">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h4 class="mb-0">User Roles</h4>
                            <button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#createRoleModal">
                                Create Role
                            </button>
                        </div>
                        <div class="card-body p-0">
                            <div class="app-datatable-default overflow-auto">
                                <table id="example" class="display app-data-table default-data-table">
                                    <thead>
                                        <tr>
                                            <th>SR NO</th>
                                            <th>Role</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @foreach($roles as $index => $role)
                                            <tr>
                                                <td>{{ $index + 1 }}</td>
                                                <td>{{ $role->name }}</td>
                                                <td>
                                                    <a href="#" class="btn btn-light-success icon-btn b-r-4 edit-role-btn"
                                                        data-role-id="{{ $role->id }}" data-role-name="{{ $role->name }}"
                                                        data-bs-toggle="modal" data-bs-target="#updateRoleModal">
                                                        <i class="ti ti-edit text-success"></i>
                                                    </a>
                                                   <a href="{{ route('roles.delete', $role->id) }}"
                                                        onclick="return confirm('Delete role {{ $role->name }}?')"
                                                        class="btn btn-light-danger icon-btn b-r-4">
                                                        <i class="ti ti-trash text-danger"></i>
                                                    </a>
                                                    <a href="{{ route('roles.assign.permission', $role->id) }}"
                                                       
                                                        class="btn btn-sm btn-light-primary b-r-4">
                                                        Assign Permission
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

    <div class="modal fade" id="createRoleModal" tabindex="-1" aria-labelledby="createRoleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <form method="POST" action="{{ route('roles.store') }}">
                @csrf
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="createRoleModalLabel">Create New Role</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group mb-3">
                            <label for="role-name">Role Name</label>
                            <input type="text" name="name" class="form-control" id="role-name" placeholder="Enter role name"
                                required>
                            @error('name')
                                <small class="text-danger d-block mt-1">{{ $message }}</small>
                            @enderror
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-success">Save Role</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
    <!-- Body main section ends -->
    <!-- 🔁 Update Role Modal -->
    <div class="modal fade" id="updateRoleModal" tabindex="-1" aria-labelledby="updateRoleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <form method="POST" id="updateRoleForm">
                @csrf
                @method('PUT')
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Update Role</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group mb-3">
                            <label for="edit-role-name">Role Name</label>
                            <input type="text" name="name" id="edit-role-name" class="form-control" required>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">Update</button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    </div>
                </div>
            </form>
        </div>
    </div>


    <script>
        document.addEventListener('DOMContentLoaded', function () {
            const editButtons = document.querySelectorAll('.edit-role-btn');
            const roleNameInput = document.getElementById('edit-role-name');
            const updateForm = document.getElementById('updateRoleForm');

            editButtons.forEach(button => {
                button.addEventListener('click', function () {
                    const roleId = this.dataset.roleId;
                    const roleName = this.dataset.roleName;

                    roleNameInput.value = roleName;

                    // Update form action dynamically
                    updateForm.action = `/roles/${roleId}`;
                });
            });
        });
    </script>

@endsection
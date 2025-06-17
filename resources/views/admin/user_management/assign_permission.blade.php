@extends('layouts.app')

@section('title')
| {{ $page_title }}
@endsection

@section('content')
<main>
    <div class="container-fluid">
        <div class="row m-1">
            <div class="col-12">
                <h4 class="main-title">Assign Permission to Role</h4>
            </div>
        </div>

        <div class="row">
            <div class="col-12">
                <form action="{{ route('roles.assign.permission.store', $role->id) }}" method="POST">
                    @csrf
                    @method('PUT')
                    <div class="card">
                        <div class="card-header">
                            <h5>Edit Role: {{ $role->name }}</h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3 row">
                                <label for="name" class="col-md-4 col-form-label text-md-end text-start">Role Name</label>
                                <div class="col-md-6">
                                    <input type="text"
                                           class="form-control @error('name') is-invalid @enderror"
                                           id="name"
                                           name="name"
                                           value="{{ $role->name }}">
                                    @if ($errors->has('name'))
                                        <span class="text-danger">{{ $errors->first('name') }}</span>
                                    @endif
                                </div>
                            </div>

                          
                            <div class="row">
                                <div class="col-12 col-md-3">
                                     <div class="card">
                                    <div class="card-header">
                                        <h5>Permissions</h5>
                                    </div>
                                    <div class="card-body">
                                    <div class="vertical-tab setting-tab">
                                    <ul class="nav nav-tabs app-tabs-primary" id="v-bg" role="tablist">
                                        @foreach ($permissions->groupBy(function($item) {
                                            return explode('.', $item->name)[0]; 
                                        }) as $key => $group)
                                        
                                            <li class="nav-item" role="presentation">
                                                <a class="nav-link {{ $loop->first ? 'active' : '' }}"
                                                   id="pills-{{ $key }}-tab"
                                                   data-bs-toggle="pill"
                                                   href="#pane-{{ $key }}">
                                                    {{ ucwords(str_replace('_', ' ', $key)) }}
                                                </a>
                                            </li>
                                        @endforeach
                                    </ul>
                                </div>
                                  </div>
                                    </div>
                                      </div>

                                <div class="col-12 col-md-9">
                                    <div class="tab-content" id="pills-tabContent">
                                        @foreach ($permissions->groupBy(function($item) {
                                            return explode('.', $item->name)[0];
                                        }) as $key => $group)
                                            <div class="tab-pane fade {{ $loop->first ? 'show active' : '' }}"
                                                 id="pane-{{ $key }}">
                                                <h6>{{ ucwords(str_replace('_', ' ', $key)) }}</h6>
                                                <hr>
                                                <div class="row">
                                                    @foreach ($group as $perm)
                                                        <div class="col-md-6 mb-2">
                                                            <div class="form-check">
                                                                <input class="form-check-input"
                                                                       type="checkbox"
                                                                       name="permissions[]"
                                                                       id="permission_{{ $perm->id }}"
                                                                       value="{{ $perm->id }}"
                                                                       {{ in_array($perm->id, $rolePermissions) ? 'checked' : '' }}>
                                                                <label class="form-check-label"
                                                                       for="permission_{{ $perm->id }}">
                                                                    {{ ucwords(str_replace('.', ' ', $perm->name)) }}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    @endforeach
                                                </div>
                                            </div>
                                        @endforeach
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div class="card-footer text-end">
                            <button type="submit" class="btn btn-primary">Update Role</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</main>
@endsection

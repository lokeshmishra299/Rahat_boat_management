@extends('layouts.app')
@section('title')
    | {{ $page_title }}
@endsection

@section('content')

    <!-- Body main section starts -->
    <main>
        <div class="container-fluid">
            <!-- Breadcrumb start -->
            <div class="row m-1">
                <div class="col-12 ">
                    <h4 class="main-title mb-3">Inspection Records</h4>
                   
                </div>
            </div>

            <!-- Breadcrumb end -->

            <!-- Data Table start -->
            <div class="row">
                <!-- Default Datatable start -->
                <div class="col-12">
                    <div class="card ">                        
                        <div class="card-body p-0">
                            <div class="app-datatable-default overflow-auto">
                                <table id="example" class="display app-data-table default-data-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Position</th>
                                            <th>Office</th>
                                            <th>Age</th>
                                            <th>Start date</th>
                                            <th>Salary</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Tiger Nixon</td>
                                            <td><span class="badge text-light-primary">System Architect</span></td>
                                            <td>Edinburgh</td>
                                            <td>61</td>
                                            <td>$3674.55</td>
                                            <td>$320,800</td>
                                            <td>
                                                <button type="button" class="btn btn-light-success icon-btn b-r-4">
                                                    <i class="ti ti-edit text-success"></i>
                                                </button>
                                                <button type="button"
                                                    class="btn btn-light-danger icon-btn b-r-4 delete-btn">
                                                    <i class="ti ti-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Garrett Winters</td>
                                            <td><span class="badge text-light-success">Accountant</span></td>
                                            <td>Tokyo</td>
                                            <td>63</td>
                                            <td>2011-07-25</td>
                                            <td>$170,750</td>
                                            <td>
                                                <button type="button" class="btn btn-light-success icon-btn b-r-4">
                                                    <i class="ti ti-edit text-success"></i>
                                                </button>
                                                <button type="button"
                                                    class="btn btn-light-danger icon-btn b-r-4 delete-btn">
                                                    <i class="ti ti-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Ashton Cox</td>
                                            <td><span class="badge text-light-secondary">Junior Technical Author</span></td>
                                            <td>San Francisco</td>
                                            <td>66</td>
                                            <td>2009-01-12</td>
                                            <td>$86,000</td>
                                            <td>
                                                <button type="button" class="btn btn-light-success icon-btn b-r-4">
                                                    <i class="ti ti-edit text-success"></i>
                                                </button>
                                                <button type="button"
                                                    class="btn btn-light-danger icon-btn b-r-4 delete-btn">
                                                    <i class="ti ti-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                        
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Default Datatable end -->

            </div>
            <!-- Data Table end -->
        </div>
    </main>

    <!-- Body main section ends -->
@endsection
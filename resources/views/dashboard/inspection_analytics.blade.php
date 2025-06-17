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
                    <h4 class="main-title mb-3">Inspection Analytics</h4>
                   
                </div>
            </div>

            <!-- Breadcrumb end -->

            <!-- Data Table start -->
            <div class="row">

                <div class="col-3">
                    <div class="card eshop-cards">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="bg-primary h-40 w-40 d-flex-center b-r-15 f-s-18">
                                    <i class="ph-bold  ph-map-pin-line"></i>
                                </span>
                                <div class="dropdown">
                                    <a href="#" class="text-primary" role="button" data-bs-toggle="dropdown"
                                        aria-expanded="false">
                                        Last Month<i class="ti ti-chevron-down ms-1"></i>
                                    </a>
                                    <ul class="dropdown-menu  dropdown-menu-end">
                                        <li><a class="dropdown-item" href="#">Last Month</a></li>
                                        <li><a class="dropdown-item" href="#">Last Week</a></li>
                                        <li><a class="dropdown-item" href="#">Last Year</a></li>
                                    </ul>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="flex-shrink-0 align-self-end">
                                    <p class="f-s-16 mb-0">Total Districts</p>
                                    <h5>25,220k <span class="f-s-12 text-danger">-45%</span></h5>
                                </div>
                                <div class="visits-chart">
                                    <div id="visitsChart"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-3">
                    <div class="card eshop-cards">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="bg-secondary h-40 w-40 d-flex-center b-r-15 f-s-18">
                                    <i class="ph-bold  ph-shopping-cart"></i>
                                </span>
                                <div class="dropdown">
                                    <a href="#" class="text-secondary " role="button" data-bs-toggle="dropdown"
                                        aria-expanded="false">
                                        Weekly<i class="ti ti-chevron-down ms-1"></i>
                                    </a>
                                    <ul class="dropdown-menu  dropdown-menu-end">
                                        <li><a class="dropdown-item" href="#">Monthly</a></li>
                                        <li><a class="dropdown-item" href="#">Weekly</a></li>
                                        <li><a class="dropdown-item" href="#">Yearly</a></li>
                                    </ul>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center position-relative">
                                <div class="flex-shrink-0 align-self-end">
                                    <p class="f-s-16 mb-0">Total Boats</p>
                                    <h5>45,782k <span class="f-s-12 text-success">+65%</span></h5>
                                </div>
                                <div class="order-chart">
                                    <div id="orderChart"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-3">
                    <div class="card eshop-cards">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="bg-success h-40 w-40 d-flex-center b-r-15 f-s-18">
                                    <i class="ph-bold  ph-pulse"></i>
                                </span>
                                <div class="dropdown">
                                    <a href="#" class="text-success " role="button" data-bs-toggle="dropdown"
                                        aria-expanded="false">
                                        Today<i class="ti ti-chevron-down ms-1"></i>
                                    </a>
                                    <ul class="dropdown-menu  dropdown-menu-end">
                                        <li><a class="dropdown-item" href="#">Today</a></li>
                                        <li><a class="dropdown-item" href="#">Tomorrow</a></li>
                                        <li><a class="dropdown-item" href="#">Last Week</a></li>
                                    </ul>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="flex-shrink-0 align-self-end">
                                    <p class="f-s-16 mb-0">Total Ghaats</p>
                                    <h5>45k</h5>
                                </div>
                                <div class="activity-chart">
                                    <div id="activityChart"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-3">
                    <div class="card eshop-cards">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="bg-warning h-40 w-40 d-flex-center b-r-15 f-s-18">
                                    <i class="ph-fill  ph-coins"></i>
                                </span>
                                <div class="dropdown">
                                    <a href="#" class="text-warning " role="button" data-bs-toggle="dropdown"
                                        aria-expanded="false">
                                        February<i class="ti ti-chevron-down ms-1"></i>
                                    </a>
                                    <ul class="dropdown-menu  dropdown-menu-end">
                                        <li><a class="dropdown-item" href="#">January</a></li>
                                        <li><a class="dropdown-item" href="#">February</a></li>
                                        <li><a class="dropdown-item" href="#">March</a></li>
                                        <li><a class="dropdown-item" href="#">April</a></li>
                                        <li><a class="dropdown-item" href="#">...</a></li>
                                    </ul>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="flex-shrink-0 align-self-end">
                                    <p class="f-s-16 mb-0">Avg Completion</p>
                                    <h5>$63,987<span class="f-s-12 text-success">+68%</span></h5>
                                </div>
                                <div class="sales-chart">
                                    <div id="salesChart"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Default Datatable start -->
                <div class="col-12">
                    <div class="card ">
                        <div class="card-body p-0">
                            <div class="app-datatable-default overflow-auto">
                                <table id="example" class="display app-data-table default-data-table">
                                    <thead>
                                        <tr>
                                            <th>District</th>
                                            <th>Boats</th>
                                            <th>Ghaats</th>
                                            <th>Completion</th>
                                            <th>Last Update</th>
                                            <th>Status</th>
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
                                        <tr>
                                            <td>Cedric Kelly</td>
                                            <td><span class="badge text-light-info">Senior Javascript Developer</span></td>
                                            <td>Edinburgh</td>
                                            <td>22</td>
                                            <td>2012-03-29</td>
                                            <td>$433,060</td>
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
@endsection
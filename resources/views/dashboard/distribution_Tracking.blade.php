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
                    <h4 class="main-title mb-3">Distribution Tracking</h4>
                    <!-- <ul class="app-line-breadcrumbs mb-3">
                        <li class="">
                            <a href="#" class="f-s-14 f-w-500">
                                <span>
                                    <i class="ph-duotone  ph-table f-s-16"></i> Table
                                </span>
                            </a>
                        </li>
                        <li class="active">
                            <a href="#" class="f-s-14 f-w-500">Data Table</a>
                        </li>
                    </ul> -->
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
                                        <tr>
                                            <td>Airi Satou</td>
                                            <td><span class="badge text-light-success">Accountant</span></td>
                                            <td>Tokyo</td>
                                            <td>33</td>
                                            <td>2008-11-28</td>
                                            <td>$162,700</td>
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
                                            <td>Brielle Williamson</td>
                                            <td><span class="badge text-light-danger"> Integration Specialist</span></td>
                                            <td>New York</td>
                                            <td>61</td>
                                            <td>2012-12-02</td>
                                            <td>$372,000</td>
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
                                            <td>Herrod Chandler</td>
                                            <td><span class="badge text-light-dark">Sales Assistant</span></td>
                                            <td>San Francisco</td>
                                            <td>59</td>
                                            <td>2012-08-06</td>
                                            <td>$137,500</td>
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
                                            <td>Rhona Davidson</td>
                                            <td><span class="badge text-light-light">Integration Specialist</span></td>
                                            <td>Tokyo</td>
                                            <td>55</td>
                                            <td>2010-10-14</td>
                                            <td>$327,900</td>
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
                                            <td>Colleen Hurst</td>
                                            <td><span class="badge text-light-primary">Javascript Developer</span></td>
                                            <td>San Francisco</td>
                                            <td>39</td>
                                            <td>2009-09-15</td>
                                            <td>$205,500</td>
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
                                            <td>Sonya Frost</td>
                                            <td><span class="badge text-light-info">Software Engineer</span></td>
                                            <td>Edinburgh</td>
                                            <td>23</td>
                                            <td>2008-12-13</td>
                                            <td>$103,600</td>
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
                                            <td>Jena Gaines</td>
                                            <td><span class="badge text-light-danger">Office Manager</span></td>
                                            <td>London</td>
                                            <td>30</td>
                                            <td>2008-12-19</td>
                                            <td>$90,560</td>
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
                                            <td>Quinn Flynn</td>
                                            <td><span class="badge text-light-secondary">Support Lead</span></td>
                                            <td>Edinburgh</td>
                                            <td>22</td>
                                            <td>2013-03-03</td>
                                            <td>$342,000</td>
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
                                            <td>Charde Marshall</td>
                                            <td><span class="badge text-light-info">Regional Director</span></td>
                                            <td>San Francisco</td>
                                            <td>36</td>
                                            <td>2008-10-16</td>
                                            <td>$470,600</td>
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
                                            <td>Haley Kennedy</td>
                                            <td><span class="badge text-light-primary">Senior Marketing Designer</span></td>
                                            <td>London</td>
                                            <td>43</td>
                                            <td>2012-12-18</td>
                                            <td>$313,500</td>
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
                                            <td>Tatyana Fitzpatrick</td>
                                            <td><span class="badge text-light-info">Regional Director</span></td>
                                            <td>London</td>
                                            <td>19</td>
                                            <td>2010-03-17</td>
                                            <td>$385,750</td>
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
                                            <td>Michael Silva</td>
                                            <td><span class="badge text-light-warning">Marketing Designer</span></td>
                                            <td>London</td>
                                            <td>66</td>
                                            <td>2012-11-27</td>
                                            <td>$198,500</td>
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
                                            <td>Paul Byrd</td>
                                            <td><span class="badge text-light-secondary">Chief Financial Officer
                                                    (CFO)</span></td>
                                            <td>New York</td>
                                            <td>64</td>
                                            <td>2010-06-09</td>
                                            <td>$725,000</td>
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
                                            <td>Gloria Little</td>
                                            <td><span class="badge text-light-success">Systems Administrator</span></td>
                                            <td>New York</td>
                                            <td>59</td>
                                            <td>2009-04-10</td>
                                            <td>$237,500</td>
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
                                            <td>Bradley Greer</td>
                                            <td><span class="badge text-light-info">Software Engineer</span></td>
                                            <td>London</td>
                                            <td>41</td>
                                            <td>2012-10-13</td>
                                            <td>$132,000</td>
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
                                            <td>Dai Rios</td>
                                            <td><span class="badge text-light-danger">Personnel Lead</span></td>
                                            <td>Edinburgh</td>
                                            <td>35</td>
                                            <td>2012-09-26</td>
                                            <td>$217,500</td>
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
                                            <td>Jenette Caldwell</td>
                                            <td><span class="badge text-light-dark">Personnel Lead</span></td>
                                            <td>New York</td>
                                            <td>30</td>
                                            <td>2011-09-03</td>
                                            <td>$345,000</td>
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
                                            <td>Yuri Berry</td>
                                            <td><span class="badge text-light-info">Development Lead</span></td>
                                            <td>New York</td>
                                            <td>40</td>
                                            <td>2009-06-25</td>
                                            <td>$675,000</td>
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
                                            <td>Caesar Vance</td>
                                            <td><span class="badge text-light-warning">Pre-Sales Support</span></td>
                                            <td>New York</td>
                                            <td>21</td>
                                            <td>2011-12-12</td>
                                            <td>$106,450</td>
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
                                            <td>Doris Wilder</td>
                                            <td><span class="badge text-light-dark">Sales Assistant</span></td>
                                            <td>Sydney</td>
                                            <td>23</td>
                                            <td>2010-09-20</td>
                                            <td>$85,600</td>
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
                                            <td>Angelica Ramos</td>
                                            <td><span class="badge text-light-secondary">Chief Executive Officer
                                                    (CEO)</span></td>
                                            <td>London</td>
                                            <td>47</td>
                                            <td>2009-10-09</td>
                                            <td>$1,200,000</td>
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
                                            <td>Gavin Joyce</td>
                                            <td><span class="badge text-light-light">Developer</span></td>
                                            <td>Edinburgh</td>
                                            <td>42</td>
                                            <td>2010-12-22</td>
                                            <td>$92,575</td>
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
                                            <td>Jennifer Chang</td>
                                            <td><span class="badge text-light-info">Regional Director</span></td>
                                            <td>Singapore</td>
                                            <td>28</td>
                                            <td>2010-11-14</td>
                                            <td>$357,650</td>
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
                                            <td>Brenden Wagner</td>
                                            <td><span class="badge text-light-info">Software Engineer</span></td>
                                            <td>San Francisco</td>
                                            <td>28</td>
                                            <td>2011-06-07</td>
                                            <td>$206,850</td>
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
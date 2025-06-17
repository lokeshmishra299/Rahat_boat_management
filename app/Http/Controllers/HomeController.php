<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        return view('index');
    }


      public function Home()
    {
        $page_title = 'Home';

        return view('dashboard.home' ,compact('page_title'));
    }
      public function Profile()
    {
        $page_title = 'Profile';

        return view('dashboard.profile' ,compact('page_title'));
    }

      public function district_dashboard()
    {
        $page_title = 'District Monitoring Dashoard';

        return view('dashboard.district' ,compact('page_title'));
    }
      public function add_boat()
    {
        $page_title = 'Register New Boat';

        return view('dashboard.new_boat' ,compact('page_title'));
    }


     public function boat_directory()
    {
        $page_title = 'Boat Directory';

        return view('dashboard.boat_directory' ,compact('page_title'));
    }


      public function add_ghaat()
    {
        $page_title = 'Register New Ghaat';

        return view('dashboard.new_ghaat' ,compact('page_title'));
    }


     public function ghaat_directory()
    {
        $page_title = 'Ghaat Directory';

        return view('dashboard.ghaat_directory' ,compact('page_title'));
    }


       public function Record_Distribution()
    {
        $page_title = 'Register New Boat';

        return view('dashboard.record_distribution' ,compact('page_title'));
    }


     public function Distribution_Tracking()
    {
        $page_title = 'Distribution Tracking';

        return view('dashboard.distribution_tracking' ,compact('page_title'));
    }




         public function Inspection()
    {
        $page_title = 'Conduct Inspection';

        return view('dashboard.create_inspection' ,compact('page_title'));
    }


     public function Records()
    {
        $page_title = 'Inspection Records
';

        return view('dashboard.inspection_records' ,compact('page_title'));
    }


       public function Schedule()
    {
        $page_title = 'Inspection Schedule';

        return view('dashboard.inspection_schedule' ,compact('page_title'));
    }


     public function Analytics()
    {
        $page_title = 'Inspection Analytics';

        return view('dashboard.inspection_analytics' ,compact('page_title'));
    }


}

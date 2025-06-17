<!-- tap on top -->
<div class="go-top">
  <span class="progress-value">
    <i class="ti ti-arrow-up"></i>
  </span>
</div>

<!-- Footer Section starts-->
<footer>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-9 col-12">
        <ul class="footer-text">
          <li>
            <p class="mb-0">Copyright © 2024 ra-admin. All rights reserved 💖</p>
          </li>
          <li> <a href="#"> V1.0.0 </a></li>
        </ul>
      </div>
      <div class="col-md-3">
        <ul class="footer-text text-end">
          <li> <a href="document.html"> Need Help <i class="ti ti-help"></i></a></li>
        </ul>
      </div>
    </div>
  </div>
</footer>
<!-- Footer Section ends-->
</div>
<!-- modal -->
<!-- <div class="modal" tabindex="-1" id="welcomeCard" data-bs-backdrop="static">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content welcome-card">

        <div class="modal-body p-0">
          <div class="text-center position-relative welcome-card-content z-1 p-3">
            <div class="text-end">
              <i class="ti ti-x fs-5 text-dark f-w-600" data-bs-dismiss="modal"></i>
            </div>
            <h2 class="f-w-600"><span>Welcome !</span>👋 </h2>
            <h6 class="f-s-15 text-dark f-w-500 mx-0 mx-sm-5"> Start Multipurpose, clean modern responsive bootstrap 5 admin template </h6>

            <div>
              <img src="{{ asset('assets/images/modals/welcome-1.png') }}" alt="img" class=" img-fluid">
            </div>
            <div class="mt-3 mb-4">
              <button type="button" class="btn btn-primary text-white btn-lg" data-bs-dismiss="modal">Let's
                Started <i class="ti ti-chevrons-right"></i> </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div> -->

<div id="customizer"></div>

<!-- latest jquery-->
<script src="{{ asset('assets/js/jquery-3.6.3.min.js')}}"></script>
<script src="{{ asset('assets/vendor/datatable/jquery-3.5.1.js')}}"></script>

<!-- Bootstrap js-->
<script src="{{ asset('assets/vendor/bootstrap/bootstrap.bundle.min.js')}}"></script>

<!-- Simple bar js-->
<script src="{{ asset('assets/vendor/simplebar/simplebar.js')}}"></script>

<!-- phosphor js -->
<script src="{{ asset('assets/vendor/phosphor/phosphor.js')}}"></script>

<!-- vector map plugin js -->
<script src="{{ asset('assets/vendor/vector-map/jquery-jvectormap-2.0.5.min.js')}}"></script>
<script src="{{ asset('assets/vendor/vector-map/jquery-jvectormap-world-mill.js')}}"></script>

<!-- slick-file -->
<script src="{{ asset('assets/vendor/slick/slick.min.js')}}"></script>

<!--cleave js  -->
<script src="{{ asset('assets/vendor/cleavejs/cleave.min.js')}}"></script>

<!-- apexcharts-->
<script src="{{ asset('assets/vendor/apexcharts/apexcharts.min.js')}}"></script>

<!-- data table js-->
<script src="{{ asset('assets/vendor/datatable/jquery.dataTables.min.js')}}"></script>
<script src="{{ asset('assets/js/data_table.js')}}"></script>

<!-- Glight js -->
<script src="{{ asset('assets/vendor/glightbox/glightbox.min.js')}}"></script>

<!-- Customizer js-->
<script src="{{ asset('assets/js/customizer.js')}}"></script>

<!-- Ecommerce js-->
<script src="{{ asset('assets/js/ecommerce_dashboard.js')}}"></script>

<!-- prism js-->
<script src="{{ asset('assets/vendor/prism/prism.min.js')}}"></script>
<script src="{{ asset('assets/vendor/sweetalert/sweetalert.js')}}"></script>

<script src="{{ asset('assets/vendor/select/select2.min.js')}}"></script>
<script src="{{ asset('assets/js/calendar.js')}}"></script>
<script src="{{ asset('assets/js/setting.js')}}"></script>
<!-- App js-->
<script src="{{ asset('assets/js/script.js') }}"></script>
<script src="{{ asset('assets/js/formvalidation.js')}}"></script>
<!-- Toastr CSS & JS -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/toastr.min.js"></script>

<script>
    @if (session('success'))
        toastr.success("{{ session('success') }}");
    @endif

    @if (session('error'))
        toastr.error("{{ session('error') }}");
    @endif

    @if (session('warning'))
        toastr.warning("{{ session('warning') }}");
    @endif

    @if (session('info'))
        toastr.info("{{ session('info') }}");
    @endif

    @if ($errors->any())        
            toastr.error("{{ $errors->first() }}");     
    @endif
</script>

</body>

</html>
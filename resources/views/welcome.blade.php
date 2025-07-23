@foreach ($boats as $boat)
    <div>
        <img src="{{ asset('storage/' . $boat->boat_image) }}" alt="Boat Image" width="300">
    </div>
@endforeach
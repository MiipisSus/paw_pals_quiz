import headshotImg from "../assets/headshot.jpg";

function UserInfo() {
  return (
    <div className="center h-screen">
      <div className="flex overflow-hidden w-7/10 h-9/10 bg-white rounded-4xl shadow-2xl border-5 border-white">
        <div className="flex-1 bg-darker-accent">
          <div className="center flex-col gap-3 h-5/10">
            <div className="overflow-hidden h-1/2 aspect-square bg-white rounded-full shadow-lg">
              <img
                src={headshotImg}
                alt="User Profile"
                className="w-full h-full object-center object-cover"
              />
            </div>
            <p className="text-white text-2xl font-semibold">User</p>
          </div>
          <div className="h-5/10 bg-gray-100"></div>
        </div>
        <div className="flex-1 bg-white"></div>
      </div>
    </div>
  );
}

export default UserInfo;

"use client";

import { useRef, useState, useEffect } from "react";
import {
  Building,
  MapPin,
  Phone,
  Home,
  Mail,
  CheckCircle2,
  Star,
  Clock,
  Shield,
  Sparkles,
  Car,
  Plane,
  Train,
  TreePine,
  Dumbbell,
  Wifi,
  ShoppingBag,
  GraduationCap,
  Hospital,
  X,
  ArrowRight,
  Calendar,
  Users,
  Award,
  Camera,
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  BuildingIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";

type ContactFormProps = {
  onClose: () => void;
  action?: string;
  isModal?: boolean;
};

const ContactForm = ({
  onClose,
  action = "Enquire Now",
  isModal = true,
}: ContactFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    budget: "₹1.09 Cr*",
    project: "Godrej Aerophase Panvel",
    action: action,
    source: "google ads",
    authorize: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "mobile") {
      // Allow only digits for mobile
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numericValue.slice(0, 10) });
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (formData.mobile.length !== 10) {
      newErrors.mobile = "Mobile number must be exactly 10 digits";
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile,
        budget: formData.budget,
        project: formData.project,
        action: formData.action,
        source: formData.source,
        authorize: formData.authorize,
      };

      const response = await axios.post(
        "https://d3ehkwll50v6ty.cloudfront.net/form",
        payload
      );

      if (response.status === 201) {
        // Redirect to thank you page with query parameters
        const queryParams = new URLSearchParams({
          name: formData.name.trim(),
          email: formData.email.trim(),
          project: formData.project,
        });

        window.location.href = `/thank-you?${queryParams.toString()}`;
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setErrors({ form: "An error occurred. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={isModal ? "relative" : ""}>
      {isModal && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 cursor-pointer"
        >
          <X className="h-6 w-6" />
        </button>
      )}

      <div className={`${isModal ? "p-8" : "p-6"} bg-white rounded-lg`}>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-blue-900 mb-2">{action}</h3>
          <p className="text-gray-600">
            Get exclusive pre-launch offers & floor plans
          </p>
        </div>

        {errors.form && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="mobile"
              required
              value={formData.mobile}
              onChange={handleChange}
              maxLength={10}
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.mobile ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter 10-digit mobile number"
            />
            {errors.mobile && (
              <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              name="authorize"
              id="authorize"
              checked={formData.authorize}
              onChange={handleChange}
              className="mt-1 mr-2 cursor-pointer"
            />
            <label
              htmlFor="authorize"
              className="text-sm text-gray-600 cursor-pointer"
            >
              I authorize representatives to contact me about this project and
              its offers.
            </label>
          </div>
          {errors.authorize && (
            <p className="text-sm text-red-500">{errors.authorize}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                {action} <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            By submitting, you agree to receive updates about this project
          </p>
        </form>
      </div>
    </div>
  );
};
export default function GodrejAeroPhase() {
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactFormAction, setContactFormAction] = useState("Enquire Now");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Refs for sections
  const heroRef = useRef(null);
  const aboutRef = useRef(null);
  const configRef = useRef(null);
  const amenitiesRef = useRef(null);
  const locationRef = useRef(null);
  const galleryRef = useRef(null);
  const contactRef = useRef(null);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-show contact form after 8 seconds for better conversion
  useEffect(() => {
    const timer = setTimeout(() => {
      setContactFormAction("Get Pre-Launch Offers");
      setShowContactForm(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleShowContactForm = (action) => {
    setContactFormAction(action);
    setShowContactForm(true);
  };

  // Project highlights data
  const highlights = [
    {
      label: "Starting Price",
      value: "₹1.09 Cr*",
      sublabel: "2 BHK Apartments",
    },
    {
      label: "Premium Location",
      value: "20 mins",
      sublabel: "from Navi Mumbai Airport",
    },
    {
      label: "Township Size",
      value: "106 Acres",
      sublabel: "Integrated Development",
    },
    { label: "Green Spaces", value: "85%+", sublabel: "Open & Green Areas" },
  ];

  // Amenities data
  const amenities = [
    { name: "9-Hole Golf Course", icon: <TreePine className="h-6 w-6" /> },
    { name: "Grand Clubhouse", icon: <Building className="h-6 w-6" /> },
    { name: "Swimming Pool", icon: <Sparkles className="h-6 w-6" /> },
    { name: "Gymnasium & Spa", icon: <Dumbbell className="h-6 w-6" /> },
    { name: "Sports Courts", icon: <Award className="h-6 w-6" /> },
    { name: "Shopping Mall", icon: <ShoppingBag className="h-6 w-6" /> },
    { name: "Kids Play Area", icon: <Users className="h-6 w-6" /> },
    { name: "Business Centre", icon: <Wifi className="h-6 w-6" /> },
  ];

  // Connectivity data
  const connectivity = [
    {
      place: "Navi Mumbai Airport",
      distance: "20 mins",
      icon: <Plane className="h-5 w-5" />,
    },
    {
      place: "Mumbai-Pune Expressway",
      distance: "10 mins",
      icon: <Car className="h-5 w-5" />,
    },
    {
      place: "Panvel Railway Station",
      distance: "15 mins",
      icon: <Train className="h-5 w-5" />,
    },
    {
      place: "Mumbai City",
      distance: "45 mins",
      icon: <Building className="h-5 w-5" />,
    },
    {
      place: "Pune City",
      distance: "80 mins",
      icon: <Car className="h-5 w-5" />,
    },
    {
      place: "JNPT Port",
      distance: "25 mins",
      icon: <MapPin className="h-5 w-5" />,
    },
  ];

  // Navigation items for footer quick links
  const navigationItems = [
    { name: "Overview", ref: heroRef },
    { name: "Configurations", ref: configRef },
    { name: "Amenities", ref: amenitiesRef },
    { name: "Location", ref: locationRef },
    { name: "Gallery", ref: galleryRef },
    { name: "Contact", ref: contactRef },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-md z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Image
                src="/logo.webp"
                alt="Godrej AeroPhase"
                width={200}
                height={50}
                className="mr-2"
              />
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => handleShowContactForm("Download Brochure")}
                className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                Download Brochure
              </button>
              <button
                onClick={() => handleShowContactForm("Book Site Visit")}
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Book Site Visit
              </button>
              <a
                href="tel:+919311377754"
                className="flex items-center text-green-600 font-semibold"
              >
                <Phone className="h-4 w-4 mr-1" />
                Call Now
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 cursor-pointer"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span className="block w-5 h-0.5 bg-current mb-1"></span>
                <span className="block w-5 h-0.5 bg-current mb-1"></span>
                <span className="block w-5 h-0.5 bg-current"></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4">
            <div className="space-y-3">
              <button
                onClick={() => handleShowContactForm("Download Brochure")}
                className="block w-full text-left py-2 text-blue-600 font-medium cursor-pointer"
              >
                Download Brochure
              </button>
              <button
                onClick={() => handleShowContactForm("Book Site Visit")}
                className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-center cursor-pointer"
              >
                Book Site Visit
              </button>
              <a
                href="tel:+919311377754"
                className="flex items-center justify-center py-2 text-green-600 font-semibold cursor-pointer"
              >
                <Phone className="h-4 w-4 mr-1" />
                Call Now
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="pt-20 pb-16 bg-gradient-to-br from-blue-50 to-cyan-50"
      >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Limited time offer badge */}
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 mt-6 rounded-full text-sm font-semibold mb-6">
                <Clock className="h-4 w-4 mr-2" />
                Pre-Launch Offer - Limited Time
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-blue-900 mb-6">
                <span className="text-blue-600">Godrej AeroPhase</span>
                <br />
                Panvel
              </h1>

              <p className="text-xl lg:text-2xl text-gray-700 mb-4">
                Luxury 2 & 3 BHK Apartments
              </p>

              <p className="text-lg text-gray-600 mb-8">
                20 minutes from upcoming Navi Mumbai International Airport
                <br />
                106-acre integrated township with world-class amenities
              </p>

              {/* Key highlights */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {highlights.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-md"
                  >
                    <div className="text-2xl font-bold text-blue-600">
                      {item.value}
                    </div>
                    <div className="text-sm font-medium text-gray-800">
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500">{item.sublabel}</div>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() =>
                    handleShowContactForm("Get Price & Floor Plans")
                  }
                  className="bg-blue-600 text-white cursor-pointer px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Get Price & Floor Plans
                </button>
                <button
                  onClick={() => handleShowContactForm("Book Site Visit")}
                  className="border-2 border-blue-600 cursor-pointer text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all"
                >
                  Book Free Site Visit
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center space-x-6 mt-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-1 text-green-600" />
                  RERA Approved
                </div>
                <div className="flex items-center">
                  <Award className="h-4 w-4 mr-1 text-blue-600" />
                  Godrej Properties
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                  125+ Years Legacy
                </div>
              </div>
            </div>

            <div className="lg:order-2">
              <div className="relative">
                <img
                  src="https://symbiosisinfrabucket.s3.ap-south-1.amazonaws.com/Godrej+Aerophase/10.webp"
                  alt="Godrej AeroPhase Luxury Apartments"
                  className="w-full rounded-2xl shadow-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent rounded-2xl"></div>

                {/* Floating elements */}
                <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-lg">
                  <div className="flex items-center text-green-600">
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    <span className="font-semibold">Ready to Move</span>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">₹1.09Cr*</div>
                    <div className="text-sm">Starting Price</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Configuration Section */}
      <section ref={configRef} className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Luxury Configurations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Thoughtfully designed 2 & 3 BHK apartments with premium finishes
              and spacious layouts
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* 2 BHK Configuration */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
                <h3 className="text-3xl font-bold mb-2">2 BHK</h3>
                <p className="text-blue-100">Perfect for small families</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      ₹1.09 Cr*
                    </div>
                    <div className="text-sm text-gray-600">Starting Price</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      686-850
                    </div>
                    <div className="text-sm text-gray-600">Sq.Ft. Range</div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
                    <span>2 Spacious Bedrooms</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
                    <span>2 Modern Bathrooms</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
                    <span>Premium Modular Kitchen</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
                    <span>Balcony with Garden View</span>
                  </div>
                </div>

                <button
                  onClick={() => handleShowContactForm("Enquire for 2 BHK")}
                  className="w-full bg-blue-600 cursor-pointer text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Get 2 BHK Details
                </button>
              </div>
            </div>

            {/* 3 BHK Configuration */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                <h3 className="text-3xl font-bold mb-2">3 BHK</h3>
                <p className="text-purple-100">Ideal for growing families</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      ₹1.79 Cr*
                    </div>
                    <div className="text-sm text-gray-600">Starting Price</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      1000-1200
                    </div>
                    <div className="text-sm text-gray-600">Sq.Ft. Range</div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
                    <span>3 Luxurious Bedrooms</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
                    <span>3 Designer Bathrooms</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
                    <span>Large Living & Dining</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-3" />
                    <span>Master Bedroom Balcony</span>
                  </div>
                </div>

                <button
                  onClick={() => handleShowContactForm("Enquire for 3 BHK")}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors cursor-pointer"
                >
                  Get 3 BHK Details
                </button>
              </div>
            </div>
          </div>

          {/* Special Features */}
          <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-center text-blue-900 mb-8">
              Premium Features in Every Home
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-1">Premium Flooring</h4>
                <p className="text-sm text-gray-600">
                  Vitrified tiles & wooden floors
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Home className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold mb-1">Modern Kitchen</h4>
                <p className="text-sm text-gray-600">
                  Modular kitchen with appliances
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold mb-1">24/7 Security</h4>
                <p className="text-sm text-gray-600">
                  Gated community with CCTV
                </p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Car className="h-8 w-8 text-yellow-600" />
                </div>
                <h4 className="font-semibold mb-1">Covered Parking</h4>
                <p className="text-sm text-gray-600">
                  Dedicated car parking space
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section ref={amenitiesRef} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              World-Class Amenities
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience resort-style living with 50+ premium amenities designed
              for your lifestyle
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {amenities.map((amenity, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg text-center hover:bg-blue-50 hover:shadow-md transition-all group"
              >
                <div className="text-blue-600 group-hover:text-blue-700 mb-3 flex justify-center">
                  {amenity.icon}
                </div>
                <h3 className="font-semibold text-gray-800">{amenity.name}</h3>
              </div>
            ))}
          </div>

          {/* Featured Amenities Showcase */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">
                  9-Hole Championship Golf Course
                </h3>
                <p className="text-gray-700 mb-6">
                  Designed by renowned golf course architect Frank Henegan,
                  enjoy a world-class golfing experience right at your doorstep.
                  The lush green fairways offer the perfect escape from city
                  life.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                    <span>Professional 9-hole course</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                    <span>Golf academy & pro shop</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                    <span>Driving range & putting green</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                    <span>Golf cart facility</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-blue-600 mb-3">
                  <Dumbbell className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-bold mb-2">Premium Clubhouse</h4>
                <p className="text-gray-600 text-sm">
                  Multi-level grand clubhouse with gym, spa, swimming pool and
                  recreational facilities
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-purple-600 mb-3">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-bold mb-2">Retail Plaza</h4>
                <p className="text-gray-600 text-sm">
                  On-site shopping and dining options for daily convenience and
                  entertainment
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Connectivity */}
      <section ref={locationRef} className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Prime Location & Connectivity
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Strategically located in Panvel with excellent connectivity to
              Mumbai, Pune and major business hubs
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            <div>
              <h3 className="text-2xl font-bold text-blue-900 mb-6">
                Excellent Connectivity
              </h3>
              <div className="space-y-4">
                {connectivity.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-white p-4 rounded-lg shadow-sm"
                  >
                    <div className="text-blue-600 mr-4">{item.icon}</div>
                    <div className="flex-grow">
                      <div className="font-semibold text-gray-800">
                        {item.place}
                      </div>
                    </div>
                    <div className="text-blue-600 font-bold">
                      {item.distance}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-xl font-bold text-blue-900 mb-6">
                Upcoming Infrastructure
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Plane className="h-5 w-5 text-blue-600 mr-3 mt-1" />
                  <div>
                    <div className="font-semibold">
                      Navi Mumbai International Airport
                    </div>
                    <div className="text-sm text-gray-600">
                      India's largest greenfield airport - operational soon
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Train className="h-5 w-5 text-green-600 mr-3 mt-1" />
                  <div>
                    <div className="font-semibold">
                      Mumbai Trans Harbour Link
                    </div>
                    <div className="text-sm text-gray-600">
                      Reduces travel time to South Mumbai significantly
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Building className="h-5 w-5 text-purple-600 mr-3 mt-1" />
                  <div>
                    <div className="font-semibold">Navi Mumbai SEZ</div>
                    <div className="text-sm text-gray-600">
                      Major employment hub with IT and financial companies
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Nearby Landmarks */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-blue-900 mb-6 text-center">
              Nearby Landmarks & Facilities
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
                <div className="font-semibold mb-1">Education</div>
                <div className="text-sm text-gray-600">
                  St. Wilfred's School, International Schools
                </div>
              </div>
              <div className="text-center">
                <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <Hospital className="h-6 w-6 text-green-600" />
                </div>
                <div className="font-semibold mb-1">Healthcare</div>
                <div className="text-sm text-gray-600">
                  Gandhi Hospital, Apollo Clinic
                </div>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="h-6 w-6 text-purple-600" />
                </div>
                <div className="font-semibold mb-1">Shopping</div>
                <div className="text-sm text-gray-600">
                  Orion Mall, D-Mart, Reliance Smart
                </div>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="font-semibold mb-1">Recreation</div>
                <div className="text-sm text-gray-600">
                  Adlabs Imagica, Karnala Bird Sanctuary
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section ref={galleryRef} className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Project Gallery
            </h2>
            <p className="text-xl text-gray-600">
              Take a virtual tour of luxury living at Godrej AeroPhase
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[
              {
                src: "https://symbiosisinfrabucket.s3.ap-south-1.amazonaws.com/Godrej+Aerophase/10.webp",
              },
              {
                src: "https://symbiosisinfrabucket.s3.ap-south-1.amazonaws.com/Godrej+Aerophase/11.webp",
              },
              {
                src: "https://symbiosisinfrabucket.s3.ap-south-1.amazonaws.com/Godrej+Aerophase/12.webp",
              },
              {
                src: "https://symbiosisinfrabucket.s3.ap-south-1.amazonaws.com/Godrej+Aerophase/4.webp",
              },
              {
                src: "https://symbiosisinfrabucket.s3.ap-south-1.amazonaws.com/Godrej+Aerophase/5.webp",
              },
              {
                src: "https://symbiosisinfrabucket.s3.ap-south-1.amazonaws.com/Godrej+Aerophase/6.webp",
              },
              {
                src: "https://symbiosisinfrabucket.s3.ap-south-1.amazonaws.com/Godrej+Aerophase/7.webp",
              },
              {
                src: "https://symbiosisinfrabucket.s3.ap-south-1.amazonaws.com/Godrej+Aerophase/8.webp",
              },
              {
                src: "https://symbiosisinfrabucket.s3.ap-south-1.amazonaws.com/Godrej+Aerophase/9.webp",
              },

              {
                src: "https://symbiosisinfrabucket.s3.ap-south-1.amazonaws.com/Godrej+Aerophase/1.webp",
              },

              {
                src: "https://symbiosisinfrabucket.s3.ap-south-1.amazonaws.com/Godrej+Aerophase/2.webp",
              },
              {
                src: "https://symbiosisinfrabucket.s3.ap-south-1.amazonaws.com/Godrej+Aerophase/3.webp",
              },
            ].map((image, index) => (
              <div
                key={index}
                className="relative group overflow-hidden rounded-xl shadow-lg"
              >
                <img
                  src={image.src}
                  alt="godrej aerophase panvel"
                  className="w-full h-64 object-cover transition-transform group-hover:scale-110"
                />
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => handleShowContactForm("Request Virtual Tour")}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Camera className="h-5 w-5 mr-2" />
              Request Virtual Tour
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              Why Choose Godrej AeroPhase?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the perfect blend of luxury, location, and lifestyle
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Building className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                Trusted Developer
              </h3>
              <p className="text-gray-600 mb-4">
                Godrej Properties with 125+ years of excellence and trust in
                real estate development
              </p>
              <div className="text-sm text-gray-500">
                • 250+ Awards & Recognition
                <br />
                • RERA Approved Projects
                <br />• Timely Delivery Record
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                Prime Location
              </h3>
              <p className="text-gray-600 mb-4">
                20 minutes from upcoming Navi Mumbai Airport with excellent
                connectivity to Mumbai & Pune
              </p>
              <div className="text-sm text-gray-500">
                • Airport City Development
                <br />
                • Major Infrastructure Projects
                <br />• High Appreciation Potential
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="bg-purple-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-4">
                Luxury Lifestyle
              </h3>
              <p className="text-gray-600 mb-4">
                106-acre integrated township with 9-hole golf course and 50+
                premium amenities
              </p>
              <div className="text-sm text-gray-500">
                • Resort-style Living
                <br />
                • Championship Golf Course
                <br />• World-class Amenities
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              What Our Residents Say
            </h2>
            <p className="text-xl text-gray-600">
              Real experiences from happy homeowners
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Rajesh Sharma",
                role: "IT Professional",
                content:
                  "The connectivity to Mumbai is excellent, and the golf course is a dream come true. Best investment decision we made!",
                rating: 5,
              },
              {
                name: "Priya Patel",
                role: "Banker",
                content:
                  "Beautiful apartments with top-notch amenities. The kids love the play areas and swimming pool. Highly recommended!",
                rating: 5,
              },
              {
                name: "Amit Kumar",
                role: "Business Owner",
                content:
                  "Godrej's quality is unmatched. The location near the airport is perfect for my business travels. Great appreciation too!",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-800">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={contactRef} className="py-20 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-blue-600 mb-4">
                Contact Us
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Interested in Godrej Aerophase Panvel? Our expert team is here
                to guide you through every step of your luxury property journey.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold text-blue-600 mb-6">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <PhoneIcon className="h-6 w-6 mr-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-700">Phone</p>
                      <p className="text-gray-600">+91 9311377754</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MailIcon className="h-6 w-6 mr-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-700">Email</p>
                      <p className="text-gray-600">
                        symbiosisinfragurgaon@gmail.com
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="h-6 w-6 mr-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-700">Site Address</p>
                      <p className="text-gray-600">
                        Village Thombrewadi, Panvel, Navi Mumbai - 410206
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-blue-600 mb-4">
                    Corporate Office
                  </h4>
                  <div className="flex items-center mb-4">
                    <BuildingIcon className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="text-gray-700">
                      Symbiosis Infra Pvt. Ltd.
                    </span>
                  </div>
                  <p className="text-gray-700 mb-6">
                    20th Floor, Tower 1, Dlf Corporate Greens, Sector 74,
                    Southern Peripheral Road, Gurugram-122004, Haryana, India
                  </p>
                </div>

                <div className="mt-8">
                  <h4 className="text-lg font-semibold text-blue-600 mb-4">
                    Follow Us
                  </h4>
                  <div className="flex space-x-4">
                    {[
                      {
                        icon: "facebook",
                        url: "https://www.facebook.com/profile.php?id=100088563983528",
                      },
                      {
                        icon: "twitter",
                        url: "https://x.com/SymbiosisI28658",
                      },
                      {
                        icon: "instagram",
                        url: "https://www.instagram.com/symbiosis.infra/",
                      },
                      {
                        icon: "linkedin",
                        url: "https://www.linkedin.com/company/symbiosisinfra/",
                      },
                    ].map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        className="text-blue-600 hover:text-blue-700 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          {social.icon === "facebook" && (
                            <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                          )}
                          {social.icon === "twitter" && (
                            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                          )}
                          {social.icon === "instagram" && (
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          )}
                          {social.icon === "linkedin" && (
                            <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                          )}
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md">
                <ContactForm
                  onClose={() => setShowContactForm(false)}
                  action={contactFormAction}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">
                Godrej AeroPhase
              </h3>
              <p className="mb-4">
                Luxury 2 & 3 BHK apartments in 106-acre integrated township with
                9-hole golf course and world-class amenities by Godrej
                Properties.
              </p>
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span>Village Thombrewadi, Panvel, Navi Mumbai</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {navigationItems.slice(0, 6).map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => scrollToSection(item.ref)}
                      className="text-white hover:text-blue-200 transition cursor-pointer"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  <span>+91 9311377754</span>
                </div>
                <div className="flex items-center">
                  <MailIcon className="h-5 w-5 mr-2" />
                  <span>symbiosisinfragurgaon@gmail.com</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-4">Newsletter</h3>
              <p className="mb-4">
                Subscribe to receive updates about Godrej AeroPhase and
                exclusive offers.
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="p-2 w-full bg-white text-gray-700 border border-white rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button className="bg-blue-600 text-white p-2 rounded-r-md hover:bg-blue-500 transition cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-blue-800 mt-12 pt-6 text-sm text-blue-100/80">
            <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
              <p>
                &copy; {new Date().getFullYear()} Symbiosis Infra Pvt Ltd. All
                rights reserved.
              </p>
              <div className="space-x-4">
                <Link href="/disclaimer" className="hover:underline">
                  Disclaimer
                </Link>
                <Link href="/privacy" className="hover:underline">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:underline">
                  Terms & Conditions
                </Link>
              </div>
            </div>
            <p className="mt-4 text-xs">
              RERA Registration Numbers: P52000052251, P52000077918,
              P52000077924
            </p>
            <p className="mt-2 text-xs">
              Disclaimer: This website provides general information about Godrej
              AeroPhase project. All specifications, amenities, and pricing
              mentioned are subject to change and should be verified with the
              developer. Images used are for representational purposes only.
              Godrej Properties Limited reserves the right to make modifications
              to the project without prior notice. Interested buyers are advised
              to visit the site and verify all details before making any
              investment decisions.
            </p>
          </div>
        </div>
      </footer>

      {/* Fixed Elements */}

      {/* Mobile Contact Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 p-3">
        <div className="grid grid-cols-2 gap-3">
          <a
            href="tel:+919311377754"
            className="bg-green-500 text-white py-3 px-4 rounded-lg text-center font-semibold flex items-center justify-center"
          >
            <Phone className="h-4 w-4 mr-1" />
            Call Now
          </a>
          <button
            onClick={() => handleShowContactForm("Get Best Price")}
            className="bg-blue-600 text-white py-3 px-4 rounded-lg text-center font-semibold"
          >
            Get Price
          </button>
        </div>
      </div>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/919311377754?text=Hi%2C%20I%27m%20interested%20in%20Godrej%20AeroPhase%20Panvel.%20Please%20share%20more%20details."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-40 right-6 z-40 bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-all duration-300 animate-pulse"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
        </svg>
      </a>

      {/* Back to Top */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-22 right-6 z-30 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          <ArrowRight className="h-5 w-5 rotate-[-90deg]" />
        </button>
      )}

      {/* Contact Modal */}
      {showContactForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={(e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
              setShowContactForm(false);
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden"
            ref={modalRef}
          >
            <ContactForm
              onClose={() => setShowContactForm(false)}
              action={contactFormAction}
            />
          </div>
        </div>
      )}
    </div>
  );
}

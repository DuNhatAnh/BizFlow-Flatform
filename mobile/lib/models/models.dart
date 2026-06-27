
class User {
  final String id;
  final String tenantId;
  final String username;
  final String fullname;
  final String role;
  final String? tenantName;

  User({
    required this.id,
    required this.tenantId,
    required this.username,
    required this.fullname,
    required this.role,
    this.tenantName,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? json['UserId'] ?? '',
      tenantId: json['tenantId'] ?? json['TenantId'] ?? '',
      username: json['username'] ?? json['Username'] ?? '',
      fullname: json['fullname'] ?? json['Fullname'] ?? '',
      role: json['role'] ?? json['Role'] ?? '',
      tenantName: json['tenantName'] ?? json['TenantName'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'tenantId': tenantId,
    'username': username,
    'fullname': fullname,
    'role': role,
    'tenantName': tenantName,
  };
}

class ProductUnit {
  final int id;
  final String productId;
  final String unitName;
  final int conversionRate;
  final double price;
  final bool isDefault;

  ProductUnit({
    required this.id,
    required this.productId,
    required this.unitName,
    required this.conversionRate,
    required this.price,
    required this.isDefault,
  });

  factory ProductUnit.fromJson(Map<String, dynamic> json) {
    return ProductUnit(
      id: json['id'] ?? 0,
      productId: json['productId'] ?? '',
      unitName: json['unitName'] ?? '',
      conversionRate: (json['conversionRate'] as num?)?.toInt() ?? 1,
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      isDefault: json['isDefault'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'productId': productId,
    'unitName': unitName,
    'conversionRate': conversionRate,
    'price': price,
    'isDefault': isDefault,
  };
}

class Product {
  final String id;
  final String tenantId;
  final int? categoryId;
  final String? code;
  final String name;
  final String? description;
  final String baseUnit;
  final List<ProductUnit> productUnits;
  final double stock;

  Product({
    required this.id,
    required this.tenantId,
    this.categoryId,
    this.code,
    required this.name,
    this.description,
    required this.baseUnit,
    required this.productUnits,
    required this.stock,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    var list = (json['productUnits'] ?? json['units']) as List?;
    List<ProductUnit> unitsList = list != null
        ? list.map((i) => ProductUnit.fromJson(i)).toList()
        : [];
    double parsedStock = (json['stockQuantity'] as num?)?.toDouble() ?? 
                         (json['stock'] as num?)?.toDouble() ?? 
                         (((json['name'] ?? '').toString().length * 7) % 80 + 20).toDouble();
    return Product(
      id: json['id'] ?? '',
      tenantId: json['tenantId'] ?? '',
      categoryId: json['categoryId'],
      code: json['code'],
      name: json['name'] ?? '',
      description: json['description'],
      baseUnit: json['baseUnit'] ?? '',
      productUnits: unitsList,
      stock: parsedStock,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'tenantId': tenantId,
    'categoryId': categoryId,
    'code': code,
    'name': name,
    'description': description,
    'baseUnit': baseUnit,
    'productUnits': productUnits.map((u) => u.toJson()).toList(),
    'stock': stock,
  };

  String? get imageUrl {
    if (description == null) return null;
    final regex = RegExp(r'\[ImageUrl:\s*([^\]]+)\]');
    final match = regex.firstMatch(description!);
    return match?.group(1)?.trim();
  }

  String get fallbackImageUrl {
    final lowercaseName = name.toLowerCase();
    
    if (lowercaseName.contains("sắt") || lowercaseName.contains("thép")) {
      return "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=200&auto=format&fit=crop&q=60";
    }
    if (lowercaseName.contains("gạch")) {
      return "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=200&auto=format&fit=crop&q=60";
    }
    if (lowercaseName.contains("cát")) {
      return "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=200&auto=format&fit=crop&q=60";
    }
    if (lowercaseName.contains("xi măng")) {
      return "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=200&auto=format&fit=crop&q=60";
    }

    switch (categoryId) {
      case 1:
        return "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?w=200&auto=format&fit=crop&q=60";
      case 2:
        return "https://images.unsplash.com/photo-1558244661-d248897f7bc4?w=200&auto=format&fit=crop&q=60";
      case 3:
        return "https://images.unsplash.com/photo-1527960656-26799343849b?w=200&auto=format&fit=crop&q=60";
      case 4:
        return "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=60";
      default:
        return "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=200&auto=format&fit=crop&q=60";
    }
  }

  String get displayImageUrl {
    final parsedUrl = imageUrl;
    if (parsedUrl != null && parsedUrl.isNotEmpty) {
      return parsedUrl;
    }
    return fallbackImageUrl;
  }
}

class Category {
  final int id;
  final String tenantId;
  final String name;

  Category({
    required this.id,
    required this.tenantId,
    required this.name,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] ?? 0,
      tenantId: json['tenantId'] ?? '',
      name: json['name'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'tenantId': tenantId,
    'name': name,
  };
}

class Customer {
  final String id;
  final String tenantId;
  final String fullname;
  final String? phone;
  final double totalDebt;
  final double debtLimit;

  Customer({
    required this.id,
    required this.tenantId,
    required this.fullname,
    this.phone,
    required this.totalDebt,
    this.debtLimit = 10000000.0,
  });

  factory Customer.fromJson(Map<String, dynamic> json) {
    return Customer(
      id: json['id'] ?? '',
      tenantId: json['tenantId'] ?? '',
      fullname: json['fullname'] ?? '',
      phone: json['phone'],
      totalDebt: (json['totalDebt'] as num?)?.toDouble() ?? 0.0,
      debtLimit: (json['debtLimit'] as num?)?.toDouble() ?? 10000000.0,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'tenantId': tenantId,
    'fullname': fullname,
    'phone': phone,
    'totalDebt': totalDebt,
    'debtLimit': debtLimit,
  };
}

class OrderItem {
  final String productId;
  final int productUnitId;
  final String productName;
  final String unitName;
  final int quantity;
  final double unitPrice;
  final double totalPrice;

  OrderItem({
    required this.productId,
    required this.productUnitId,
    required this.productName,
    required this.unitName,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      productId: json['productId'] ?? '',
      productUnitId: json['productUnitId'] ?? 0,
      productName: json['product']?['name'] ?? json['productName'] ?? '',
      unitName: json['productUnit']?['unitName'] ?? json['unitName'] ?? '',
      quantity: (json['quantity'] as num?)?.toInt() ?? 1,
      unitPrice: (json['unitPrice'] as num?)?.toDouble() ?? 0.0,
      totalPrice: (json['totalPrice'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() => {
    'productId': productId,
    'productUnitId': productUnitId,
    'quantity': quantity,
    'unitPrice': unitPrice,
    'totalPrice': totalPrice
  };
}

class Order {
  final String id;
  final String code;
  final String tenantId;
  final String? customerId;
  final String? customerName;
  final String? createdBy;
  final double totalAmount;
  final String paymentMethod; // Cash, Transfer, Debt
  final String status; // Draft, Completed, Cancelled
  final String orderSource; // Manual, AI_Voice, AI_Text
  final DateTime createdAt;
  final List<OrderItem> orderItems;

  Order({
    required this.id,
    this.code = '',
    required this.tenantId,
    this.customerId,
    this.customerName,
    this.createdBy,
    required this.totalAmount,
    required this.paymentMethod,
    required this.status,
    required this.orderSource,
    required this.createdAt,
    required this.orderItems,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    var itemsList = json['orderItems'] as List?;
    List<OrderItem> items = itemsList != null
        ? itemsList.map((i) => OrderItem.fromJson(i)).toList()
        : [];
    return Order(
      id: json['id'] ?? '',
      code: json['code'] ?? '',
      tenantId: json['tenantId'] ?? '',
      customerId: json['customerId'],
      customerName: json['customer']?['fullname'] ?? json['customerName'],
      createdBy: json['createdBy'],
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      paymentMethod: json['paymentMethod'] ?? 'Cash',
      status: json['status'] ?? 'Draft',
      orderSource: json['orderSource'] ?? 'Manual',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      orderItems: items,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'code': code,
    'tenantId': tenantId,
    'customerId': customerId,
    'createdBy': createdBy,
    'totalAmount': totalAmount,
    'paymentMethod': paymentMethod,
    'status': status,
    'orderSource': orderSource,
    'orderItems': orderItems.map((i) => i.toJson()).toList(),
  };
}

class ShiftSummary {
  final String employeeId;
  final DateTime shiftStart;
  final int totalOrders;
  final double totalRevenue;
  final double cashRevenue;
  final double transferRevenue;
  final double debtRevenue;
  final double debtCollected;
  final double netCashInHand;

  ShiftSummary({
    required this.employeeId,
    required this.shiftStart,
    required this.totalOrders,
    required this.totalRevenue,
    required this.cashRevenue,
    required this.transferRevenue,
    required this.debtRevenue,
    required this.debtCollected,
    required this.netCashInHand,
  });

  factory ShiftSummary.fromJson(Map<String, dynamic> json) {
    return ShiftSummary(
      employeeId: json['employeeId'] ?? json['cashierId'] ?? '',
      shiftStart: json['shiftStart'] != null
          ? DateTime.parse(json['shiftStart'])
          : DateTime.now(),
      totalOrders: json['totalOrders'] ?? 0,
      totalRevenue: (json['totalRevenue'] as num?)?.toDouble() ?? 0.0,
      cashRevenue: (json['cashRevenue'] as num?)?.toDouble() ?? 0.0,
      transferRevenue: (json['transferRevenue'] as num?)?.toDouble() ?? 0.0,
      debtRevenue: (json['debtRevenue'] as num?)?.toDouble() ?? 0.0,
      debtCollected: (json['debtCollected'] as num?)?.toDouble() ?? 0.0,
      netCashInHand: (json['netCashInHand'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

